const server_url = "https://agenda-online-back-end.vercel.app"
const token = localStorage.getItem('token');

//Bloqueio de pagina para sem token
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

//Calendario
document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');
    const form = document.getElementById('taskForm');

    // Função para buscar tarefas do backend
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${server_url}/api/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao buscar tarefas');
            const tasks = await response.json();

            return tasks.map(task => ({
            id: task._id,                 // ID da tarefa
            title: task.title,            // Apenas o título será mostrado no calendário
            start: task.dueDate,          // Data e hora de início
            extendedProps: {              // Detalhes adicionais acessíveis no clique
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

    // Função para criar nova tarefa
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

    // Função para deletar tarefa
    const deleteTask = async (taskId) => {
        try {
            const response = await fetch(`${server_url}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Erro ao deletar tarefa');
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
            alert('Erro ao deletar tarefa.');
        }
    };

    // Configuração do FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        timeZone: 'America/Sao_Paulo', // Define o fuso horário do calendário
        events: fetchTasks, // Busca as tarefas do backend
        eventTimeFormat: { // Formato de horário exibido
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Formato 24 horas
        },
        eventClick: async (info) => {
            const { id, title, extendedProps, start } = info.event;

            const formattedDate = new Date(start).toLocaleString('pt-BR', {
                timeZone: 'UTC',
                hour12: false,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Exibir informações da tarefa
            const taskDetails = `Tarefa: ${title}\nData: ${formattedDate}\nDescrição: ${extendedProps.description}`;
            if (confirm(`${taskDetails}\n\nDeseja deletar esta tarefa?`)) {
                await deleteTask(id); // Deletar tarefa no backend
                info.event.remove(); // Remover do calendário
                alert('Tarefa deletada com sucesso!');
            }
        }
    });
    

    calendar.render();

    // Manipular o envio do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const dueDate = document.getElementById('dueDate').value;
        const description = document.getElementById('description').value;

        const newTask = await createTask({ title, dueDate, description });

        if (newTask) {
            calendar.addEvent({
                id: newTask._id,
                title: newTask.title,
                start: newTask.dueDate,
                extendedProps: { description: newTask.description }
            });
            alert('Tarefa criada com sucesso!');
            calendar.refetchEvents();
            form.reset();
        }
    });
});
