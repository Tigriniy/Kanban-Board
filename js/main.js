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
                                <button @click="editTask(task, 'planned')"></button>
                                <button @click="deleteTask(task.id, 'planned')"></button>
                                <button @click="moveTask(task, 'planned', 'inProgress')"> В работу</button>
                            </div>
                        </div>
                    </div>
                    <button @click="addTask('planned')">+ Добавить</button>
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
                                <button @click="editTask(task, 'inProgress')"></button>
                                <button @click="deleteTask(task, 'inProgress', 'testing')">Тестирование</button>/
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
                                <button @click="editTask(task, 'testing')"></button>
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
                updatedAt: null
            };

            this[column].push(task);
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
            }
        }
    },
    deleteTask(taskId, column) {
        if (confirm('Удалить задачу?')) {
            const index = this[column].findIndex(t => t.id === taskId);
            if (index !== -1) {
                this[column].splice(index, 1);
            }
        }
    },
    moveTask(task, from, to) {
        const index = this[from].findIndex(t => t.id === task.id);
        if (index !== -1) {
            const movedTask = this[from].splice(index, 1)[0];
            this[to].push(movedTask);
        }
    },
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU');
    }
}
});