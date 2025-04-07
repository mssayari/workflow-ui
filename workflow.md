# Fully dynamic Automation System (Zapier-style)

This document describes a dynamic and modular automation system, inspired by Zapier. The system allows users to create
workflows that can be triggered by different events and execute chains of
actions based on conditions.

---

## Core Concept

The automation system enables users to define workflows that follow this structure:

1. **Trigger:** Defines how the workflow starts (e.g., scheduler, API, webhook).
2. **Actions:** Defines a sequence of tasks to execute (e.g., fetch data, export to CSV, send email).
3. **Chaining:** Each action can define what happens on success or failure.
4. **Providers:** Actions can be performed using different providers selected dynamically by users.

---

## Database Design (MongoDB)

Each workflow is stored as a document in MongoDB with fields like:

```json
{
  "name": "Export and Upload Workflow",
  "trigger": {
    "type": "schedule",
    "config": {
      "cron": "0 6 * * *",
      "timezone": "UTC",
      "exceptions": {
        "dates": [
          "2025-04-06",
          "2025-06-25"
        ]
      }
    }
  },
  "actions": [
    {
      "id": "action_1",
      "type": "fetch_data",
      "provider": "default",
      "config": {
        "collection": "users",
        "filters": {
          "status": "active"
        },
        "columns": {
          "name": "Customer Name",
          "email": "Customer Email",
          "created_at": "Registered Date"
        }
      },
      "onSuccess": "action_2"
    },
    {
      "id": "action_2",
      "type": "export_csv",
      "provider": "default",
      "config": {
        "path": "/exports/customers.csv",
        "format": "csv"
      },
      "onSuccess": "action_3"
    },
    {
      "id": "action_3",
      "type": "ftp_upload",
      "provider": "filezilla",
      "config": {
        "remote_path": "/exports/customers.csv"
      },
      "onSuccess": "action_4"
    },
    {
      "id": "action_4",
      "type": "send_email",
      "provider": "mailjet",
      "config": {
        "to": "admin@example.com",
        "subject": "File Uploaded",
        "body": "Your file has been successfully uploaded."
      },
      "onSuccess": "action_5"
    },
    {
      "id": "action_5",
      "type": "api_request",
      "provider": "default",
      "config": {
        "url": "https://amazon-store.com/api/upload",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer <api_key>"
        },
        "data": {
          "file_path": "/exports/customers.csv"
        }
      }
    }
  ]
}
```

---

## Trigger Types

- **Schedule (cron)**: Run periodically.
- **Webhook/API**: Run when an endpoint is called.
- **Internal event listener**: Triggered from the app (e.g., model updated).

### Scheduler

to trigger the workflow, we can use a cron job. The cron job will call the workflow execution endpoint at the specified
interval. Cron Job already handles a lot of complex scheduling logic like skipping specific weekdays or specific days of
the month. To extend it, I've added a new field called `exceptions` to the trigger config. This field can contain a list
of dates that should be skipped when executing the workflow.

### Webhook/API

To trigger the workflow, users can set up a webhook URL. When an external system sends a request to this URL, the
workflow is executed.

the example below shows how to define a webhook trigger in the workflow document:

```json
{
  "type": "webhook",
  "config": {
    "url": "/api/workflow/trigger",
    "method": "POST"
  }
}
```

to execute the workflow, the external system would send a POST request to the specified URL. The request can include any
necessary data in the body or query parameters, which can be accessed within the workflow actions.

For now, we can keep things simple and just call the workflow with their unique ID to execute it. like the below
example:

Router:

```php
Route::post('/api/workflow/trigger/{workflowId}', [WorkflowController::class, 'handle']);
```

Controller:

```php
class WorkflowController extends Controller
{
    public function handle(Request $request, $workflowId)
    {
        $workflow = Workflow::find($workflowId);
        if (!$workflow) {
            return response()->json(['error' => 'Workflow not found'], 404);
        }

        dispatch(new ExecuteActionJob($workflow->actions[0]));

        return response()->json(['message' => 'Workflow started']);
    }
}
```

In the future, if we want fully dynamic webhook endpoints (e.g. /webhooks/{custom_name}), we can use the url and method
in the config to match the request and trigger the workflow.

### Internal event listener

To use internal event triggers, we can listen to all events emitted by the system. Since our project uses a single
model (Collection) for all collections and tables, we can capture all relevant events from this model. Whenever an event
is triggered, we call a handler to check whether it matches a trigger defined in the workflow configuration. If a match
is found, the corresponding workflow is executed.

For example, if we want to trigger a workflow when a new user is created, we can define a trigger like this:

```json
{
  "type": "event",
  "config": {
    "event": "user.created"
  }
}
```

Then, in the event listener, we can check for this event and execute the workflow accordingly.

```php
namespace App\Observers;

use App\Models\Collection;

class DynamicEntityObserver
{
    public function updated(Collection $model)
    {
    $table = $model->getTable();
        
    $workflow = Workflow::where('trigger.type', 'event')
    ->where('trigger.config.event', $table . '.updated')->first();
    
    dispatch(new ExecuteActionJob($workflow->actions[0]));
    }
}
```

We might have some custom events and listeners in the system that we can manually add to the list of available events,
so users can select it while creating their workflows.

---

## Action Types

Supported actions include:

- `fetch_data`: Get data from MongoDB
- `export_csv`: Convert data to CSV with dynamic column mapping
- `ftp_upload`: Upload file to remote server via FTP/SFTP
- `email`: Send notification email using selected provider
- `api_request`: Call an external API (e.g., Amazon Store API)
- ...

---

## Provider System Design

Each action is implemented in a generic way and supports multiple providers. We will have a list of available providers
for each action type. The user can select the provider they want to use when configuring the action.
Some providers might need some extra configuration like API keys, credentials, etc. We can define these in the `config`
field of the action. When user chooses a provider, we can show them the required fields to fill in.

To store users' credentials, we will store them in the actions config field. To maintain security, we will encrypt the
credentials before storing them in the database. We can use Laravel's built-in encryption methods for this.

```json
{
  "type": "send_email",
  "provider": "mailjet",
  "config": {
    "to": "example@example.com",
    "subject": "Test Email",
    "body": "Your data is ready."
  }
}
```

For the actions that doesn't require any provider, we can just set the provider to `default`. For example,
the `export_csv` action doesn't need a provider since it just converts data to CSV format. The reason we are using
the provider system is to keep the code modular and allow for easy addition of new providers in the future.

---

## Executing Actions

To execute actions dynamically, we can use a factory and strategy pattern.

### Factory Example

```php
class ActionHandlerFactory
{
    public static function getHandler(string $type,string $provider, array $config): ActionHandlerInterface
    {
        return match ($type) {
            'email' => match ($provider) {
                'mailjet' => new MailjetHandler($config),
                'gmail' => new GmailHandler($config),
                'proton' => new ProtonHandler($config),
                default => throw new \Exception("Unknown email provider")
            },
            'ftp_upload' => match ($provider) {
                'filezilla' => new FilezillaHandler($config),
                'sftp' => new SftpHandler(),
                default => throw new \Exception("Unknown FTP provider")
            },
            'fetch_data' => match ($provider) {
                'default' => new FetchDataHandler($config),
                'custom' => new CustomFetchDataHandler($config),
                default => throw new \Exception("Unknown fetch data provider")
            },
            'export_csv' => match ($provider) {
                'default' => new ExportCsvHandler($config),
                'custom' => new CustomExportCsvHandler($config),
                default => throw new \Exception("Unknown export CSV provider")
            },
            'api_request' => match ($provider) {
                'default' => new ApiRequestHandler($config),
                default => throw new \Exception("Unknown API request provider")
            },
            default => throw new \Exception("Unknown action type")
        };
    }
}
```

### Strategy Pattern

```php
interface ActionHandlerInterface
{
    public function handle(array $config): array;
}
class FetchDataHandler implements ActionHandlerInterface
{
    public function handle(array $config): array
    {
        // Fetch data from MongoDB based on config
        $collection = $config['collection'];
        $filters = $config['filters'];
        $columns = $config['columns'];

        // Perform the fetch operation and return the data
        return Collection::where($filters)->get($columns);
    }
}
class ExportCsvHandler implements ActionHandlerInterface
{
    public function handle(array $config): array
    {
        // Convert data to CSV format based on config
        $path = $config['path'];
        $data = $config['data'];

        // Perform the export operation and return the file path
        $csvFile = fopen($path, 'w');
        foreach ($data as $row) {
            fputcsv($csvFile, $row);
        }
        fclose($csvFile);

        return ['file_path' => $path];
    }
}
```

## Data Flow Between Actions (Using Redis)

We will use Redis as a fast in-memory data store to pass data between actions. Each action can store its output in
Redis, and the next action can retrieve it using a unique key. This allows for efficient data sharing in all subsequent
actions. We will also use Redis to store the workflow execution status and logs.

❗ **Note:** We need to design a dynamic key structure to be
able to store and retrieve easily while supporting multiple outputs from different actions.

---

## Status Handling

Each action in the workflow supports two key outcomes: `onSuccess` and `onFailure`. In this phase, we will only actively
use the `onSuccess` path to continue the workflow execution, while the `onFailure` path is used only for logging errors
and marking the workflow as failed. Although we’re not yet executing alternative actions on failure, we’ve included this
structure intentionally. In future versions, we plan to support more advanced flow control—such as retrying failed
actions, or triggering a different branch of actions if a failure occurs. This will enable us to build complex,
fault-tolerant workflows where each step can respond differently based on its success or failure.
