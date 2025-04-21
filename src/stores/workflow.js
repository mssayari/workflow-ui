import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import axios from 'axios'
import router from "@/router/router.js";

export const useWorkflowStore = defineStore('workflow', () => {

    const baseURL = 'http://adomaticio.test/api/v1'
    const workflows = ref([])
    const triggers = ref({})
    const workflow = ref(null)
    const prettyWorkflow = computed(() => JSON.stringify(workflow.value, null, 2))


    //workflow modal
    const isWorkflowModalOpen = ref(false)
    const openWorkflowModal = () => {

        if (!workflow.value) {
            workflow.value = {
                name: 'new workflow',
                description: '',
                trigger: {
                    type: '4',
                    config: {}
                },
                actions: []
            }
        }

        isWorkflowModalOpen.value = true
    }

    const closeWorkflowModal = () => {
        isWorkflowModalOpen.value = false
    }

    const editWorkflow = (id) => {
        workflow.value = workflows.value.find(workflow => workflow.id === id)
        if (!workflow.value) {
            console.error(`Workflow with id ${id} not found`)
            return
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
                trigger: workflow.value.trigger,
            }).then(response => {
                if (response.data.success) {
                    workflow.value = response.data.data
                    workflows.value.push(workflow.value)
                    console.log('Workflow created successfully')
                    resolve(true)
                } else {
                    console.error('Failed to create workflow:', response.data.message)
                    reject(false)
                }
            }).catch(
                error => {
                    console.error('Error creating workflow:', error)
                    reject(false)
                }
            )
        })
    }

    const updateWorkflow = () => {
        return new Promise((resolve, reject) => {
            axios.put(`${baseURL}/workflows/${workflow.value.id}`, {
                name: workflow.value.name,
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
            const response = await axios.get(`${baseURL}/workflows`)
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

    const fetchWorkflowTriggers = async () => {
        try {
            const response = await axios.get(`${baseURL}/workflows/triggers`)
            if (response.data.success) {
                triggers.value = response.data.data
            } else {
                console.error('Failed to fetch workflow triggers:', response.data.message)
            }
        } catch (error) {
            console.error('Error fetching workflow triggers:', error)
            throw error
        }
    }

    const addAction = (action) => {
        axios.post(`${baseURL}/workflows/${workflow.value.id}/actions`, action)
            .then(response => {
                if (response.data.success) {
                    workflow.value.actions.push(action)
                    console.log('Action added successfully');
                } else {
                    console.error('Failed to add action:', response.data.message);
                }
            })
            .catch(error => {
                console.error('Error adding action:', error);
            });
    }

    const updateAction = (action) => {
        const index = workflow.value.actions.findIndex(a => a.id === action.id)
        if (index !== -1) {
            axios.put(`${baseURL}/workflows/${workflow.value.id}/actions/${action.id}`, action)
                .then(response => {
                    if (response.data.success) {
                        workflow.value.actions[index] = action
                        console.log('Action updated successfully');
                    } else {
                        console.error('Failed to update action:', response.data.message);
                    }
                })
                .catch(error => {
                    console.error('Error updating action:', error);
                });
        } else {
            console.error(`Action with id ${action.id} not found`);
        }
    }

    const removeAction = (index) => {
        const action = workflow.value.actions[index]
        if (!action) {
            console.error(`Action with index ${index} not found`);
            return;
        }
        axios.delete(`${baseURL}/workflows/${workflow.value.id}/actions/${action.id}`)
            .then(response => {
                if (response.data.success) {
                    console.log('Action removed successfully');
                    workflow.value.actions.splice(index, 1)
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
        triggers,
        workflows,
        isWorkflowModalOpen,
        openWorkflowModal,
        closeWorkflowModal,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        editWorkflow,
        fetchWorkflows,
        fetchWorkflowTriggers,
        addAction,
        updateAction,
        removeAction,
        resetWorkflow
    }
})