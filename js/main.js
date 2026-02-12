const app = new Vue({
    el: '#app',
    template: `
        <div class="app">
            <h1>Kanban Board</h1>
            
            <div class="board">
                <div class="column">
                    <h2>Запланированные задачи</h2>
                    <div class="cards">
                        <div class="card" v-for="task in planned" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                            <p class="meta">Создана: {{ formatDate(task.createdAt) }}</p>
                            <p class="meta">Дедлайн: {{ formatDate(task.deadline) }}</p>
                            <div class="card-actions">
                                <button @click="editTask(task, 'planned')">Edit</button>
                                <button @click="deleteTask(task.id, 'planned')">Delete</button>
                                <button @click="moveTask(task, 'planned', 'inProgress')">To Work</button>
                            </div>
                        </div>
                    </div>
                    <button @click="addTask('planned')">Add Task</button>
                </div>
                
                <div class="column">
                    <h2>Задачи в работе</h2>
                    <div class="cards">
                        <div class="card" v-for="task in inProgress" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                            <p class="meta">Создана: {{ formatDate(task.createdAt) }}</p>
                            <p class="meta">Дедлайн: {{ formatDate(task.deadline) }}</p>
                            <div class="card-actions">
                                <button @click="editTask(task, 'inProgress')">Edit</button>
                                <button @click="moveTask(task, 'inProgress', 'testing')">To Testing</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="column">
                    <h2>Тестирование</h2>
                    <div class="cards">
                        <div class="card" v-for="task in testing" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                            <p class="meta">Создана: {{ formatDate(task.createdAt) }}</p>
                            <p class="meta">Дедлайн: {{ formatDate(task.deadline) }}</p>
                            <div class="card-actions">
                                <button @click="editTask(task, 'testing')">Edit</button>
                                <button @click="moveTask(task, 'testing', 'completed')">Complete</button>
                                <button @click="returnTask(task)">Return to Work</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="column">
                    <h2>Выполненные задачи</h2>
                    <div class="cards">
                        <div class="card" v-for="task in completed" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                            <p class="meta">Создана: {{ formatDate(task.createdAt) }}</p>
                            <p class="meta">Дедлайн: {{ formatDate(task.deadline) }}</p>
                            <p class="meta" :class="{ overdue: isOverdue(task) }">
                                Status: {{ isOverdue(task) ? 'OVERDUE' : 'COMPLETED ON TIME' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
{
    planned: [],
        inProgress: [],
    testing: [],
    completed: []
},
methods: {
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
        const data = {
            planned: this.planned,
            inProgress: this.inProgress,
            testing: this.testing,
            completed: this.completed
        };
        localStorage.setItem('kanbanTasks', JSON.stringify(data));
    },
    addTask(column) {
        const title = prompt('Заголовок задачи:');
        const description = prompt('Описание:');
        const deadline = prompt('Дедлайн (ГГГГ-ММ-ДД):');

        if (title && description && deadline) {
            const task = {
                id: Date.now(),
                title: title,
                description: description,
                createdAt: new Date(),
                deadline: new Date(deadline),
                updatedAt: null,
                completedAt: null,
                isOverdue: false
            };

            this[column].push(task);
            this.saveTasks();
        }
    },
    editTask(task, column) {
        const title = prompt('Заголовок задачи:', task.title);
        const description = prompt('Описание:', task.description);
        const deadline = prompt('Дедлайн (ГГГГ-ММ-ДД):', this.formatDate(task.deadline));

        if (title && description && deadline) {
            const index = this[column].findIndex(t => t.id === task.id);
            if (index !== -1) {
                this[column][index].title = title;
                this[column][index].description = description;
                this[column][index].deadline = new Date(deadline);
                this[column][index].updatedAt = new Date();
                this.saveTasks();
            }
        }
    },
    deleteTask(taskId, column) {
        if (confirm('Удалить задачу?')) {
            const index = this[column].findIndex(t => t.id === taskId);
            if (index !== -1) {
                this[column].splice(index, 1);
                this.saveTasks();
            }
        }
    },
    moveTask(task, from, to) {
        const index = this[from].findIndex(t => t.id === task.id);
        if (index !== -1) {
            const movedTask = this[from].splice(index, 1)[0];

            if (to === 'completed') {
                movedTask.completedAt = new Date();
                movedTask.isOverdue = movedTask.deadline < new Date();
            }

            this[to].push(movedTask);
            this.saveTasks();
        }
    },
    returnTask(task) {
        const reason = prompt('Причина возврата:');
        if (reason) {
            const index = this.testing.findIndex(t => t.id === task.id);
            if (index !== -1) {
                const returnedTask = this.testing.splice(index, 1)[0];
                this.inProgress.push(returnedTask);
                this.saveTasks();
            }
        }
    },
    isOverdue(task) {
        return task.isOverdue;
    },
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU');
    }
},
mounted() {
    this.loadTasks();
}
});