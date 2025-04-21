# Abstract Version of Workflow with Generic Actions

This document outlines the design and implementation of a workflow automation system that allows users to create custom
workflows for automating tasks. This version is more generic and abstract.
---

## Core Concept

The automation system enables users to define workflows that follow this structure:

1. **Trigger:** Defines how the workflow starts (e.g., scheduler, API, webhook).
2. **Actions:** Defines a sequence of tasks to execute (e.g., fetch data, export to CSV, send email).
3. **Chaining:** Each action can define what happens on success or failure.
4. **Providers:** Actions can be performed using different providers selected dynamically by users.
5. **Dynamic Data Flow:** Actions can pass data to each other, allowing for complex workflows.

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
      "source": "api",
      "config": {
        "url": "https://third-party.com/api/vehicles",
        "method": "GET",
        "headers": {
          "Authorization": "Bearer {{ secrets.api_key }}"
        }
      },
      "onSuccess": "action_2"
    },
    {
      "id": "action_2",
      "type": "iterate",
      "provider": "default",
      "source": "action_1",
      "config": {
        "delay": 5,
        "filters": {
          "and": [
            {
              "field": "status",
              "operator": "=",
              "value": "active"
            },
            {
              "or": [
                {
                  "field": "model",
                  "operator": ">",
                  "value": 2016
                },
                {
                  "field": "id",
                  "operator": "<",
                  "value": 100
                }
              ]
            }
          ]
        }
      },
      "actions": [
        {
          "id": "download_image",
          "type": "http_request",
          "config": {
            "method": "GET",
            "url": "{{ current_item.image_url }}",
            "save_to": "public/images/{{ current_item.id }}.jpg"
          },
          "on_success": "call_api"
        },
        {
          "id": "call_api",
          "type": "api_request",
          "config": {
            "url": "https://amazon.com/api/products",
            "method": "POST",
            "headers": {
              "Authorization": "Bearer {{ secrets.amazon_key }}"
            },
            "body": {
              "model": "{{ current_item.model }}",
              "image": "{{ current_item.image_url }}"
            }
          }
        }
      ],
      "onSuccess": "action_3"
    },
    {
      "id": "action_3",
      "type": "send_email",
      "provider": "mailjet",
      "config": {
        "to": "admin@example.com",
        "subject": "Request processed",
        "body": "Your processed has been successfully completed."
      }
    }
  ]
}
```

## Actions

The key difference between this version and the previous one is how we define actions. In this version, we focus on more
generic actions and separating the responsibilities of each action. To facilitate better data flow, we’ve implemented
the concept of “source” for actions, and we’ve also defined sub-actions for greater flexibility.

For general actions like iterate, we have sub-actions to perform specific tasks within a loop. To prevent system
overload or to manage API call limitations, we provide a delay option in the configuration. This allows users to define
how long to wait before processing the next item.

In this version, we also are supporting more complex filtering capabilities. Users can apply logical operators such as
`AND`, `OR` to combine multiple conditions. Additionally, we allow the use of various comparison operators
like =, >, <, >=, <=, and != to create more dynamic and precise queries. This flexibility enables users to perform
detailed filtering on data before it is processed or used in subsequent actions.