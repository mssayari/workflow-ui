import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useActionStore = defineStore('action', () => {
    const actions = ref([
        {
            "id": 1,
            "name": "Iteration",
            "description": "Iterate over a list of items.",
            "providers": [
                {
                    "id": 1,
                    "action_type_id": 1,
                    "name": "Static",
                    "description": "Iterate over a static list of items.",
                    "form_schema": {
                        "properties": {
                            "to": {
                                "type": "number",
                                "title": "To",
                                "required": true,
                                "description": "The ending number of the iteration."
                            },
                            "from": {
                                "type": "number",
                                "title": "From",
                                "required": true,
                                "description": "The starting number of the iteration."
                            }
                        }
                    }
                },
                {
                    "id": 2,
                    "action_type_id": 1,
                    "name": "api_paginated",
                    "description": "Iterate over a paginated API response.",
                    "form_schema": {
                        "properties": {
                            "url": {
                                "type": "string",
                                "title": "URL",
                                "required": true,
                                "description": "The URL of the API endpoint."
                            },
                            "headers": {
                                "type": "json",
                                "title": "Headers",
                                "required": false,
                                "description": "The headers to include in the API request."
                            },
                            "page_param": {
                                "type": "string",
                                "title": "Page Parameter",
                                "required": true,
                                "description": "The name of the page parameter in the API request."
                            },
                            "total_pages": {
                                "type": "number",
                                "title": "Total Pages",
                                "required": true,
                                "description": "The total number of pages to iterate over."
                            },
                            "per_page_param": {
                                "type": "string",
                                "title": "Per Page Parameter",
                                "required": true,
                                "description": "The name of the per page parameter in the API request."
                            }
                        }
                    }
                },
                {
                    "id": 3,
                    "action_type_id": 1,
                    "name": "db_query",
                    "description": "Iterate over a database query result.",
                    "form_schema": {
                        "table": {
                            "type": "string",
                            "title": "Table",
                            "required": true,
                            "description": "The name of the database table to query."
                        },
                        "filters": {
                            "type": "json",
                            "title": "Filters",
                            "required": false,
                            "description": "The filters to apply to the database query."
                        },
                        "chunk_size": {
                            "type": "number",
                            "title": "Chunk Size",
                            "required": true,
                            "description": "The number of records to retrieve in each chunk."
                        }
                    }
                },
                {
                    "id": 4,
                    "action_type_id": 1,
                    "name": "csv_file",
                    "description": "Iterate over a CSV file.",
                    "form_schema": {
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "title": "File Path",
                                "required": true,
                                "description": "The path to the CSV file."
                            }
                        }
                    }
                }
            ]
        }
    ])
    const fetchActions = async () => {
        try {
            const response = await axios.get('http://adomaticio.test/api/v1/actions')
            actions.value = response.data.data
        } catch (error) {
            console.error('Failed to fetch action form schema:', error)
        }
    }

    const getActionById = (id) => {
        return actions.value.find(action => action.id === id)
    }

    const getProviderById = (actionId, providerId) => {
        const action = getActionById(actionId)
        if (action) {
            return action.providers.find(provider => provider.id === providerId)
        }
        return null
    }

    return {
        actions,
        fetchActions,
        getActionById,
        getProviderById
    }
})