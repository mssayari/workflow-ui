import {createRouter, createWebHistory} from 'vue-router'

import Index from "@/components/v2/Index.vue";
import WorkflowBuilder from "@/components/v2/WorkflowBuilder.vue";

const routes = [
    {
        path: '/',
        component: Index,
        name: 'index',
    },
    {
        path: '/workflows/:id',
        component: WorkflowBuilder,
        name: 'workflow-builder',
        props: true
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;