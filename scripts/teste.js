const server_url = "https://agenda-online-back-end.vercel.app"

//Bloqueio de pagina para sem token
const token = localStorage.getItem('token');
if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = '/paginas/LoginPage.html'; // Redireciona para login
}

//Botao de logout
document.getElementById('logoutButton').addEventListener('click', () => {
    // Remove o token armazenado no localStorage
    localStorage.removeItem('token');
    
    // Redireciona para a página de login
    window.location.href = '/paginas/LoginPage.html';

    // Opcional: Mostra uma mensagem de logout bem-sucedido
    alert('Logout realizado com sucesso!');
});

document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token'); // Pega o token JWT
    const calendarEl = document.getElementById('calendar');

    // Carregar tarefas do backend
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${server_url}/api/tasks`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao buscar tarefas');
            const tasks = await response.json();

            // Formatar tarefas para o FullCalendar
            return tasks.map(task => ({
                id: task._id,
                title: task.title,
                start: task.dueDate,
                extendedProps: {
                    description: task.description || '',
                    completed: task.completed || false
                }
            }));
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            alert('Erro ao carregar tarefas.');
            return [];
        }
    };

    // Criar uma nova tarefa no backend
    const createTask = async (task) => {
        try {
            const response = await fetch(`${server_url}/api/tasks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Erro ao criar tarefa');
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            alert('Erro ao criar tarefa.');
        }
    };

    // Deletar tarefa do backend
    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao deletar tarefa');
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            alert('Erro ao deletar tarefa.');
        }
    };

    // Inicializar o FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt',
        editable: true,
        events: await fetchTasks(), // Carregar eventos do backend

        eventClick: async function (info) {
            if (confirm('Deseja deletar esta tarefa?')) {
                await deleteTask(info.event.id);
                info.event.remove();
                alert('Tarefa deletada com sucesso.');
            }
        }
    });

    // Adicionar evento
    document.getElementById('eventForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value;

        const dueDate = `${date}T${time}:00`;

        const newTask = await createTask({
            title,
            dueDate,
            description
        });

        if (newTask) {
            calendar.addEvent({
                id: newTask._id,
                title: newTask.title,
                start: newTask.dueDate,
                extendedProps: {
                    description: newTask.description || ''
                }
            });
            alert('Tarefa criada com sucesso.');
            document.getElementById('eventForm').reset();
        }
    });

    calendar.render();
});
