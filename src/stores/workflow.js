import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import axios from 'axios'
import router from "@/router/router.js";

export const useWorkflowStore = defineStore('workflow', () => {

    const baseURL = 'http://adomaticio.test/api/v1'
    const token = ref(null)
    const workflows = ref([])
    const apps = ref([])
    const connections = ref([])
    const workflow = ref(null)
    const prettyWorkflow = computed(() => {
        // remove action from actions array and trigger from triggers array from workflow object before returning
        let workflowCopy = JSON.parse(JSON.stringify(workflow.value))

        workflowCopy.triggers = workflowCopy.triggers.map(trigger => {
            const {trigger: triggerData, ...triggerWithoutTrigger} = trigger
            return triggerWithoutTrigger
        })

        workflowCopy.actions = workflowCopy.actions.map(action => {
            const {action: actionData, ...actionWithoutAction} = action
            return actionWithoutAction
        })

        return JSON.stringify(workflowCopy, null, 2)
    })

    // TODO: clean up before sending request for the update/create


    const isActionsModalOpen = ref(false)
    const selectedAction = ref(null)
    const previousActionId = ref(null)
    const isInnerAction = ref(false)
    const isTriggerAction = ref(false)
    const openActionModal = (isTrigger, action = null, link = null, isInner = false) => {
        selectedAction.value = action
        previousActionId.value = link
        isInnerAction.value = isInner
        isTriggerAction.value = isTrigger
        isActionsModalOpen.value = true
    }

    // get connections by driver
    const getConnectionsByDriver = (driver) => {
        return connections.value.filter(connection => connection.driver === driver)
    }

    const closeActionModal = () => {
        isActionsModalOpen.value = false
        selectedAction.value = null
        previousActionId.value = null
        isTriggerAction.value = false
        isInnerAction.value = false
    }

    const saveAction = (actionData) => {
        return new Promise((resolve, reject) => {
            if (selectedAction.value && !isInnerAction.value) {
                updateAction(actionData).then(() => {
                    resolve(true)
                    closeActionModal()
                }).catch((error) => {
                    console.log('Error updating action:', error);
                    reject(error.response.data)
                });
            } else {
                const newAction = {...actionData}
                if (isInnerAction.value) {
                    newAction.parent_id = selectedAction.value.id
                }
                createAction(newAction).then((createdAction) => {
                    if (previousActionId.value) {
                        linkAction(createdAction, previousActionId.value).then(() => {
                            console.log('Action Linked successfully');
                            resolve(true)
                            closeActionModal()
                        })
                    }
                    closeActionModal()
                }).catch((error) => {
                    console.log('Error creating action:', error);
                    reject(error.response.data)
                });
            }
        });
    }

    const saveTrigger = (triggerData) => {
        return new Promise((resolve, reject) => {
            if (selectedAction.value && !isInnerAction.value) {
                updateTrigger(triggerData).then(() => {
                    resolve(true)
                    closeActionModal()
                }).catch((error) => {
                    console.log('Error updating trigger:', error);
                    reject(error.response.data)
                });
            } else {
                const newTrigger = {...triggerData}
                createTrigger(newTrigger).then((createdTrigger) => {
                    closeActionModal()
                }).catch((error) => {
                    console.log('Error creating action:', error);
                    reject(error.response.data)
                });
            }
        });
    }

    const linkAction = (action, linkId) => {
        console.log('Linking action:', action, 'to linkId:', linkId);
        return new Promise((resolve, reject) => {
            var index = -1
            var parentIndex = -1
            if (action.parent_id) {
                parentIndex = workflow.value.actions.findIndex(a => a.id === action.parent_id)
                if (parentIndex !== -1) {
                    index = workflow.value.actions[parentIndex].actions.findIndex(a => a.id === linkId)
                } else {
                    console.error(`Parent action with id ${action.parent_id} not found`);
                }
            } else {
                index = workflow.value.actions.findIndex(a => a.id === linkId)
            }

            if (index !== -1) {
                let data = {...workflow.value.actions[index], on_success: action.id}
                axios.put(`${baseURL}/workflows/${workflow.value.id}/actions/${linkId}`, data)
                    .then(response => {
                        if (response.data.success) {
                            if (action.parent_id) {
                                const parentIndex = workflow.value.actions.findIndex(a => a.id === action.parent_id)
                                workflow.value.actions[parentIndex].actions[index] = response.data.data
                            } else {
                                workflow.value.actions[index] = response.data.data
                            }
                            // workflow.value.actions[index] = response.data.data
                            console.log('Action Linked successfully');
                            resolve(true);
                        } else {
                            console.error('Failed to Link action:', response.data.message);
                            reject(false);
                        }
                    })
                    .catch(error => {
                        reject(false);
                        console.error('Error on linking action:', error);
                    });
            } else {
                console.error(`Action with id ${action.id} not found`);
            }
        });
    }

    //workflow modal
    const isWorkflowModalOpen = ref(false)
    const openWorkflowModal = () => {

        if (!workflow.value) {
            workflow.value = {
                name: 'new workflow',
                store_ref: '',
                description: '',
                folder_id: null,
                triggers: [],
                actions: []
            }
        }

        isWorkflowModalOpen.value = true
    }

    const closeWorkflowModal = () => {
        isWorkflowModalOpen.value = false
    }

    const editWorkflow = async (id) => {
        workflow.value = workflows.value.find(workflow => workflow.id === id)
        if (!workflow.value) {
            console.error(`Workflow with id ${id} not found`)
            return
        }


        // Fetch the workflow details from the API
        try {
            const response = await axios.get(`${baseURL}/workflows/${id}/actions?with=action.app&with_count=actions`)
            if (response.data.success) {
                workflow.value.actions = response.data.data
            } else {
                console.error('Failed to fetch Workflow actions:', response.data.message)
            }
        } catch (error) {
            console.error('Error fetching workflow actions:', error)
            throw error
        }

        router.push({
            name: 'workflow-builder',
            params: {id: workflow.value.id}
        })
    }

    const deleteWorkflow = async (id) => {
        const index = workflows.value.findIndex(workflow => workflow.id === id)
        if (index !== -1) {

            const response = await axios.delete(`${baseURL}/workflows/${id}`)
            if (response.data.success) {
                workflows.value.splice(index, 1)
                console.log('Workflow deleted successfully')
            } else {
                console.error('Failed to delete workflow:', response.data.message)
            }
        } else {
            console.error(`Workflow with id ${id} not found`)
        }
    }

    const createWorkflow = () => {
        return new Promise((resolve, reject) => {
            axios.post('http://adomaticio.test/api/v1/workflows', {
                name: workflow.value.name,
                store_ref: workflow.value.store_ref,
                trigger: workflow.value.trigger,
            }).then(response => {
                if (response.data.success) {
                    workflow.value = response.data.data
                    workflows.value.push(workflow.value)
                    console.log('Workflow created successfully')
                    resolve(true)
                } else {
                    console.error('Failed to create workflow:', response.data.message)
                    reject(response.data)
                }
            }).catch(
                error => {
                    console.error('Error creating workflow:', error.response.data)
                    reject(error.response.data)
                }
            )
        })
    }

    const updateWorkflow = () => {
        return new Promise((resolve, reject) => {
            axios.put(`${baseURL}/workflows/${workflow.value.id}`, {
                name: workflow.value.name,
                store_ref: workflow.value.store_ref,
                trigger: workflow.value.trigger,
            })
                .then(response => {
                    if (response.data.success) {
                        console.log('Workflow updated successfully');
                        resolve(true);
                    } else {
                        console.error('Failed to update workflow:', response.data.message);
                        reject(false);
                    }
                })
                .catch(error => {
                    console.error('Error updating workflow:', error);
                    reject(false);
                });
        });
    };

    const fetchWorkflows = async () => {
        try {
            const response = await axios.get(`${baseURL}/workflows?with=triggers.trigger.app&with_count=actions`)
            if (response.data.success) {
                workflows.value = response.data.data
            } else {
                console.error('Failed to fetch workflows:', response.data.message)
            }
        } catch (error) {
            console.error('Error fetching workflows:', error)
            throw error
        }
    }

    const fetchApps = async () => {
        try {
            const response = await axios.get(`${baseURL}/apps?with_count=actions,triggers`)
            if (response.data.success) {
                apps.value = response.data.data
            } else {
                console.error('Failed to fetch Apps:', response.data.message)
            }
        } catch (error) {
            console.error('Error fetching Apps:', error)
            throw error
        }
    }

    const fetchConnections = async () => {
        try {
            const response = await axios.get(`${baseURL}/connections`)
            if (response.data.success) {
                connections.value = response.data.data
            } else {
                console.error('Failed to fetch Connections:', response.data.message)
            }
        } catch (error) {
            console.error('Error fetching Connections:', error)
            throw error
        }
    }


    const getToken = () => {
        return new Promise((resolve, reject) => {
            axios.get(`http://adomaticio.test/auth-token`)
                .then(response => {
                    if (response.data.success) {
                        token.value = response.data.data.token
                        axios.interceptors.request.use(config => {
                            if (token.value) {
                                config.headers.Authorization = `Bearer ${token.value}`;
                            }
                            return config;
                        }, error => {
                            return Promise.reject(error);
                        });
                        resolve(true)
                    } else {
                        console.error('Failed to fetch token:', response.data.message)
                        reject(false)
                    }
                })
                .catch(error => {
                    console.error('Error fetching token:', error)
                    reject(error)
                })
        })
    }

    const fetchActions = async (app_index, isTrigger = false) => {

        // skip if app already has actions
        if (!apps.value[app_index]) {
            console.error(`App not found`)
            return
        }

        if (apps.value[app_index].actions) {
            return
        }

        try {
            const response = await axios.get(`${baseURL}/apps/${apps.value[app_index].id}/actions` + (isTrigger ? '?type=trigger' : '?type=action'))
            if (response.data.success) {
                if (apps.value[app_index]) {
                    apps.value[app_index][isTrigger ? 'triggers' : 'actions'] = response.data.data
                } else {
                    console.error(`App not found`)
                }
            } else {
                console.error('Failed to fetch Actions:', response.data.message)
            }
        } catch (error) {
            console.error('Error on fetching Actions:', error)
            throw error
        }
    }

    const createAction = (action) => {
        return new Promise((resolve, reject) => {
            axios.post(`${baseURL}/workflows/${workflow.value.id}/actions`, action)
                .then(response => {
                    if (response.data.success) {
                        workflow.value.actions.push(response.data.data)
                        console.log('Action added successfully');

                        // increment actions count for the parent action if it exists
                        // if (action.parent_id) {
                        //     const parentIndex = workflow.value.actions.findIndex(a => a.id === action.parent_id)
                        //     if (parentIndex !== -1) {
                        //         workflow.value.actions[parentIndex].actions_count = (workflow.value.actions[parentIndex].actions_count || 0) + 1
                        //     } else {
                        //         console.error(`Parent action with id ${action.parent_id} not found`);
                        //     }
                        // }

                        resolve(response.data.data);
                    } else {
                        // console.error('Failed to add action:', response.data.message);
                        reject(response.data);
                    }
                })
                .catch(error => {
                    // console.error('Error adding action:', error);
                    reject(error);
                });
        });
    }

    const createTrigger = (trigger) => {
        return new Promise((resolve, reject) => {
            axios.post(`${baseURL}/workflows/${workflow.value.id}/triggers`, trigger)
                .then(response => {
                    if (response.data.success) {
                        workflow.value.triggers.push(response.data.data)
                        console.log('Trigger added successfully');
                        resolve(response.data.data);
                    } else {
                        // console.error('Failed to add action:', response.data.message);
                        reject(response.data);
                    }
                })
                .catch(error => {
                    // console.error('Error adding action:', error);
                    reject(error);
                });
        });
    }

    const updateAction = (action) => {
        return new Promise((resolve, reject) => {

            let index = -1
            index = workflow.value.actions.findIndex(a => a.id === action.id)

            if (index !== -1) {
                axios.put(`${baseURL}/workflows/${workflow.value.id}/actions/${action.id}`, action)
                    .then(response => {
                        if (response.data.success) {
                            workflow.value.actions[index] = response.data.data
                            console.log('Action updated successfully');
                            resolve(true);
                        } else {
                            console.error('Failed to update action:', response.data.message);
                            reject(response.data);
                        }
                    })
                    .catch(error => {
                        reject(error);
                        console.error('Error updating action:', error);
                    });
            } else {
                console.error(`Action with id ${action.id} not found`);
            }
        });
    }

    const updateTrigger = (trigger) => {
        return new Promise((resolve, reject) => {
            let index = -1
            index = workflow.value.triggers.findIndex(a => a.id === trigger.id)

            if (index !== -1) {
                axios.put(`${baseURL}/workflows/${workflow.value.id}/triggers/${trigger.id}`, trigger)
                    .then(response => {
                        if (response.data.success) {
                            workflow.value.triggers[index] = response.data.data
                            console.log('Trigger updated successfully');
                            resolve(true);
                        } else {
                            console.error('Failed to update trigger:', response.data.message);
                            reject(response.data);
                        }
                    })
                    .catch(error => {
                        reject(error);
                        console.error('Error updating trigger:', error);
                    });
            } else {
                console.error(`Trigger with id ${trigger.id} not found`);
            }
        });
    }

    const removeAction = (action) => {
        let index = workflow.value.actions.findIndex(a => a.id === action.id)
        if (index === -1) {
            console.error(`Action with index ${index} not found`);
            return;
        }

        axios.delete(`${baseURL}/workflows/${workflow.value.id}/actions/${action.id}`)
            .then(response => {
                if (response.data.success) {
                    console.log('Action removed successfully');
                    workflow.value.actions.splice(index, 1)

                    // remove actionId from other actions on_success
                    workflow.value.actions.forEach(ac => {
                        if (ac.on_success === action.id) {
                            ac.on_success = null
                        }
                    })
                } else {
                    console.error('Failed to remove action:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Error removing action:', error);
            });
    }


    const resetWorkflow = () => {
        workflow.value = null
    }

    return {
        workflow,
        prettyWorkflow,
        apps,
        workflows,
        isWorkflowModalOpen,
        isActionsModalOpen,
        selectedAction,
        previousActionId,
        isInnerAction,
        isTriggerAction,
        getConnectionsByDriver,
        openActionModal,
        closeActionModal,
        openWorkflowModal,
        closeWorkflowModal,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        editWorkflow,
        fetchWorkflows,
        fetchApps,
        fetchConnections,
        fetchActions,
        removeAction,
        resetWorkflow,
        saveAction,
        saveTrigger,
        getToken,
    }
})