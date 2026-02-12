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
                        </div>
                    </div>
                </div>
                
                <div class="column">
                    <h2>Тестирование</h2>
                    <div class="cards">
                        <div class="card" v-for="task in testing" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
                        </div>
                    </div>
                </div>
                
                <div class="column">
                    <h2>Выполненные задачи</h2>
                    <div class="cards">
                        <div class="card" v-for="task in completed" :key="task.id">
                            <h3>{{ task.title }}</h3>
                            <p>{{ task.description }}</p>
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

        if (title && description) {
            const task = {
                id: Date.now(),
                title: title,