export const actionFormSchema = {
    fetch_data: {
        default: {
            collection: {type: 'input', placeholder: 'users', label: 'Collection'},
            filters: {type: 'json', label: 'Filters (JSON)', placeholder: '{ "status": "active" }'},
            columns: {type: 'json', label: 'Columns Mapping (JSON)', placeholder: '{ "name": "Customer Name" }'},
        }
    },
    export_csv: {
        default: {
            path: {type: 'input', placeholder: '/exports/data.csv', label: 'Export Path'},
            format: {type: 'select', label: 'Format', options: ['csv', 'xlsx']},
        }
    },
    ftp_upload: {
        filezilla: {
            remote_path: {type: 'input', placeholder: '/exports/data.csv', label: 'Remote Path'},
            host: {type: 'input', placeholder: 'ftp.example.com', label: 'Host'},
            username: {type: 'input', label: 'Username'},
            password: {type: 'input', inputType: 'password', label: 'Password'},
        },
        sftp: {
            remote_path: {type: 'input', placeholder: '/exports/data.csv', label: 'Remote Path'},
            host: {type: 'input', placeholder: 'sftp.example.com', label: 'Host'},
            username: {type: 'input', label: 'Username'},
            password: {type: 'input', inputType: 'password', label: 'Password'},
        }
    },
    send_email: {
        smtp: {
            host: {type: 'input', placeholder: 'smtp.example.com', label: 'SMTP Host'},
            port: {type: 'input', placeholder: '587', label: 'SMTP Port'},
            username: {type: 'input', label: 'Username'},
            password: {type: 'input', inputType: 'password', label: 'Password'},
            sender_email: {type: 'input', label: 'Sender Email'},
            sender_name: {type: 'input', label: 'Sender Name'},
            recipient_email: {type: 'input', label: 'Recipient Email'},
            subject: {type: 'input', label: 'Email Subject'},
            body: {type: 'textarea', label: 'Email Body'},
            attachments: {type: 'json', label: 'Attachments (JSON)', placeholder: '[{"path": "/path/to/file"}]'},
        },
        mailjet: {
            api_key: {type: 'input', label: 'API Key'},
            api_secret: {type: 'input', inputType: 'password', label: 'API Secret'},
            sender_email: {type: 'input', label: 'Sender Email'},
            sender_name: {type: 'input', label: 'Sender Name'},
            recipient_email: {type: 'input', label: 'Recipient Email'},
            subject: {type: 'input', label: 'Email Subject'},
            body: {type: 'textarea', label: 'Email Body'},
            attachments: {type: 'json', label: 'Attachments (JSON)', placeholder: '[{"path": "/path/to/file"}]'},

        }
    },
    api_request: {
        default: {
            url: {type: 'input', label: 'URL', placeholder: 'https://api.example.com/endpoint'},
            method: {
                type: 'select',
                label: 'Method',
                options: ['GET', 'POST', 'PUT', 'DELETE']
            },
            headers: {type: 'json', label: 'Headers (JSON)', placeholder: '{ "Authorization": "Bearer token" }'},
            data: {type: 'json', label: 'Body (JSON)', placeholder: '{ "key": "value" }'},
        }
    },
}

export const initializeConfigFromSchema = (type,provider) => {
    if (!provider) {
        provider = Object.keys(actionFormSchema[type])[0]
    }
    const schema = actionFormSchema[type][provider] || {}
    const config = {}
    for (const key in schema) {
        if (schema[key].type === 'json') {
            config[key] = {}
        } else if (schema[key].type === 'select') {
            config[key] = schema[key].options[0]
        } else {
            config[key] = ''
        }
    }
    return config
}

export const getActionTypes = () => {
    return Object.keys(actionFormSchema).map(type => ({
        value: type,
        label: type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    }))
}

export const getProviders = (type) => {
    return Object.keys(actionFormSchema[type] || {}).map(provider => ({
        value: provider,
        label: provider.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    }))
}

export const getActionByKey = (key) => {
    const actionTypes = Object.keys(actionFormSchema)
    const action = actionTypes.find(type => type === key) || null
    return {
        value: action,
        label: action ? action.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : null
    }
}

export const getProviderByKey = (type, key) => {
    const providers = Object.keys(actionFormSchema[type] || {})
    const provider =  providers.find(provider => provider === key) || null
    return {
        value: provider,
        label: provider ? provider.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : null
    }
}
