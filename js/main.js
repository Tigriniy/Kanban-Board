Vue.component('task-card', {
    props: ['task', 'column'],
    template: `
        <div class="card">
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="meta">
                <div>Создана: {{ formatDate(task.createdAt) }}</div>
                <div v-if="task.updatedAt">Изменена: {{ formatDate(task.updatedAt) }}</div>
                <div>Дедлайн: {{ formatDate(task.deadline) }}</div>
                <div v-if="task.completedAt">Выполнена: {{ formatDate(task.completedAt) }}</div>
                <div v-if="task.returnReason">Причина возврата: {{ task.returnReason }}</div>
            </div>
            <div class="actions">
                <button v-if="column !== 'completed'" @click="$emit('edit', task)"> Редактировать</button>
                <button v-if="column === 'planned'" @click="$emit('delete')"> Удалить</button>
                <button v-if="column === 'planned'" @click="$emit('toWork')"> В работу</button>
                <button v-if="column === 'inProgress'" @click="$emit('toTest')"> На тестирование</button>
                <button v-if="column === 'testing'" @click="$emit('complete')"> Завершить</button>
                <button v-if="column === 'testing'" @click="$emit('return')"> Вернуть</button>
                <div v-if="column === 'completed'" :class="task.isOverdue ? 'overdue' : 'done'">
                    {{ task.isOverdue ? 'ПРОСРОЧЕНА' : 'ВЫПОЛНЕНА В СРОК' }}
                </div>
            </div>
        </div>
    `,
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }
})

Vue.component('board-column', {
    props: ['title', 'column', 'tasks'],
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <div class="cards">
                <task-card 
                    v-for="task in tasks" 
                    :key="task.id" 
                    :task="task" 
                    :column="column"
                    @edit="$emit('edit', {task: task, column: column})"
                    @delete="$emit('delete', {id: task.id, column: column})"
                    @toWork="$emit('move', {task: task, from: column, to: 'inProgress'})"
                    @toTest="$emit('move', {task: task, from: column, to: 'testing'})"
                    @complete="$emit('move', {task: task, from: column, to: 'completed'})"
                    @return="$emit('return', task.id)"
                />
            </div>
            <button v-if="column === 'planned'" @click="$emit('add')">+ Добавить задачу</button>
        </div>
    `
})

Vue.component('task-modal', {
    props: ['show', 'task', 'returnMode'],
    template: `
        <div class="modal" v-if="show">
            <div class="modal-content">
                <h3>{{ returnMode ? 'Возврат задачи в работу' : (task ? 'Редактировать задачу' : 'Новая задача') }}</h3>
                <button class="close" @click="$emit('close')">x</button>
                
                <div v-if="!returnMode">
                    <input v-model="title" placeholder="Заголовок задачи" required>
                    <textarea v-model="description" placeholder="Описание задачи" required></textarea>
                    <input type="datetime-local" v-model="deadline" required>
                </div>
                <textarea v-if="returnMode" v-model="reason" placeholder="Причина возврата" required></textarea>
                
                <div class="buttons">
                    <button @click="save" class="save-btn">
                        {{ returnMode ? 'Вернуть в работу' : (task ? 'Сохранить' : 'Создать задачу') }}
                    </button>
                    <button @click="$emit('close')" class="cancel-btn">Отмена</button>
                </div>
            </div>
        </div>
    `,
    data:{
    title: '',
        description: '',
    deadline: '',
    reason: ''
},
watch: {
    show(newValue) {
        if (newValue && this.task) {
            this.title = this.task.title;
            this.description = this.task.description;
            this.deadline = new Date(this.task.deadline).toISOString().slice(0, 16);
            this.reason = '';
        } else if (newValue && !this.task && !this.returnMode) {
            this.title = '';
            this.description = '';
            this.deadline = ''; // ← Пусто! Пользователь должен выбрать сам
            this.reason = '';
        }
    }
},
methods: {
    save() {
        if (this.returnMode) {
            if (!this.reason.trim()) {
                alert('Укажите причину возврата!');
                return;
            }
            this.$emit('saveReturn', this.reason.trim());
        } else {
            const trimmedTitle = this.title.trim();
            const trimmedDescription = this.description.trim();

            if (!trimmedTitle || !trimmedDescription || !this.deadline) {
                alert('Заполните все поля!');
                return;
            }

            this.$emit('save', {
                title: trimmedTitle,
                description: trimmedDescription,
                deadline: new Date(this.deadline)
            });
        }
    }
}
})

new Vue({
    el: '#app',
    template: `
        <div class="app">
            <h1>Доска задач</h1>
            <div class="board">
                <board-column
                    v-for="col in columns"
                    :key="col.id"
                    :title="col.title"
                    :column="col.id"
                    :tasks="getTasks(col.id)"
                    @add="openAddModal(col.id)"
                    @edit="openEditModal"
                    @delete="deleteTask"
                    @move="moveTask"
                    @return="openReturnModal"
                />
            </div>
            
            <task-modal 
                :show="showAddModal" 
                :task="null" 
                :returnMode="false"
                @save="createTask" 
                @close="closeAddModal"
            />
            <task-modal 
                :show="showEditModal" 
                :task="editingTask" 
                :returnMode="false"
                @save="updateTask" 
                @close="closeEditModal"
            />
            <task-modal 
                :show="showReturnModal" 
                :task="null" 
                :returnMode="true"
                @saveReturn="returnTask" 
                @close="closeReturnModal"
            />
        </div>
    `,
    data:{
    planned: [],
        inProgress: [],
    testing: [],
    completed: [],

    columns: [
    { id: 'planned', title: 'Запланированные задачи', max: 3 },
    { id: 'inProgress', title: 'Задачи в работе', max: 5 },
    { id: 'testing', title: 'Тестирование', max: null },
    { id: 'completed', title: 'Выполненные задачи', max: null }
],

    showAddModal: false,
    showEditModal: false,
    showReturnModal: false,
    editingTask: null,
    returningTaskId: null,
    currentColumn: null
},
methods: {
    getTasks(columnId) {
        return this[columnId];
    },

    loadTasks() {
        const saved = localStorage.getItem('kanbanTasks');
        if (saved) {
            const data = JSON.parse(saved);
            this.planned = data.planned || [];
            this.inProgress = data.inProgress || [];
            this.testing = data.testing || [];
            this.completed = data.completed || [];
        }
    },

    saveTasks() {
        localStorage.setItem('kanbanTasks', JSON.stringify({
            planned: this.planned,
            inProgress: this.inProgress,
            testing: this.testing,
            completed: this.completed
        }));
    },

    openAddModal(columnId) {
        this.currentColumn = columnId;
        this.showAddModal = true;
    },

    closeAddModal() {
        this.showAddModal = false;
        this.currentColumn = null;
    },

    createTask(taskData) {
        this[this.currentColumn].push({
            id: Date.now(),
            title: taskData.title,
            description: taskData.description,
            createdAt: new Date(),
            deadline: taskData.deadline,
            updatedAt: null,
            completedAt: null,
            returnReason: null,
            isOverdue: false
        });
        this.closeAddModal();
        this.saveTasks();
    },

    openEditModal(data) {
        this.editingTask = data.task;
        this.currentColumn = data.column;
        this.showEditModal = true;
    },

    closeEditModal() {
        this.showEditModal = false;
        this.editingTask = null;
        this.currentColumn = null;
    },

    updateTask(taskData) {
        const task = this[this.currentColumn].find(t => t.id === this.editingTask.id);
        if (task) {
            task.title = taskData.title;
            task.description = taskData.description;
            task.deadline = taskData.deadline;
            task.updatedAt = new Date();
        }
        this.closeEditModal();
        this.saveTasks();
    },

    deleteTask(data) {
        if (confirm('Удалить задачу?')) {
            this[data.column] = this[data.column].filter(t => t.id !== data.id);
            this.saveTasks();
        }
    },

    moveTask(data) {
        const index = this[data.from].findIndex(t => t.id === data.task.id);
        const task = this[data.from].splice(index, 1)[0];

        if (data.to === 'completed') {
            task.completedAt = new Date();
            task.isOverdue = task.deadline < new Date();
        }

        this[data.to].push(task);
        this.saveTasks();
    },

    openReturnModal(taskId) {
        this.returningTaskId = taskId;
        this.showReturnModal = true;
    },

    closeReturnModal() {
        this.showReturnModal = false;
        this.returningTaskId = null;
    },

    returnTask(reason) {
        const index = this.testing.findIndex(t => t.id === this.returningTaskId);
        const task = this.testing.splice(index, 1)[0];
        task.returnReason = reason;
        task.updatedAt = new Date();
        this.inProgress.push(task);
        this.closeReturnModal();
        this.saveTasks();
    }
},
mounted() {
    this.loadTasks();
}
})
