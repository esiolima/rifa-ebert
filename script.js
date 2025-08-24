document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const vendidosCounter = document.getElementById('vendidos');
    const disponiveisCounter = document.getElementById('disponiveis');

    const loginModal = document.getElementById('login-modal');
    const showLoginButton = document.getElementById('show-login-modal');
    const logoutButton = document.getElementById('logout-button');
    const closeButton = document.querySelector('.close-button');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');

    let isAdminLoggedIn = false;
    const adminPassword = "FilhoAdotivo"; // <-- TROQUE A SENHA AQUI!

    const pixKey = "34999893400";

    // Informações do seu repositório no GitHub (SUBSTITUA AQUI!)
    const githubUsername = "ESIOLIMA_GITHUB"; // Seu nome de usuário
    const githubRepo = "RIFA-EBERT"; // Nome do seu repositório
    const githubToken = "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"; // <-- COLE SEU TOKEN AQUI!

    // Função para copiar a chave Pix
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Chave Pix copiada para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar a chave Pix: ', err);
            alert('Erro ao copiar a chave Pix. Tente manualmente: ' + text);
        });
    };
    
    document.getElementById('copy-pix-button').addEventListener('click', () => {
        copyToClipboard(pixKey);
    });

    // Funções para controle do modal
    showLoginButton.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Lógica de login
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === adminPassword) {
            isAdminLoggedIn = true;
            loginModal.style.display = 'none';
            showLoginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            alert('Login de administrador realizado com sucesso!');
            renderRaffle();
        } else {
            alert('Senha incorreta! Tente novamente.');
            passwordInput.value = '';
        }
    });

    // Lógica de logout
    logoutButton.addEventListener('click', () => {
        isAdminLoggedIn = false;
        showLoginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        alert('Logout realizado com sucesso.');
        renderRaffle();
    });

    // Função para atualizar o arquivo no GitHub
    const updateRaffleData = async (newData) => {
        const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/rifa_data.json`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            const file = await response.json();
            const sha = file.sha;

            const newContent = btoa(JSON.stringify(newData, null, 2));

            const updateResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Número vendido: ${Object.keys(newData).find(key => newData[key].status === 'vendido')}`,
                    content: newContent,
                    sha: sha
                })
            });

            if (updateResponse.ok) {
                console.log('Dados atualizados com sucesso no GitHub!');
                renderRaffle();
            } else {
                console.error('Erro ao atualizar o arquivo:', updateResponse.statusText);
                alert('Erro ao atualizar o arquivo. Tente novamente ou verifique suas permissões.');
            }

        } catch (error) {
            console.error('Erro na requisição para o GitHub:', error);
            alert('Erro de conexão com o GitHub. Verifique sua internet ou token.');
        }
    };

    // Função para buscar os dados da rifa e renderizar a grade
    const renderRaffle = async () => {
        try {
            const response = await fetch('rifa_data.json');
            const rifaData = await response.json();
            gridContainer.innerHTML = '';

            let vendidosCount = 0;
            const totalNumbers = 200;
            
            for (let i = 1; i <= totalNumbers; i++) {
                const item = document.createElement('div');
                item.classList.add('grid-item');
                item.textContent = i;

                if (rifaData[i] && rifaData[i].status === 'vendido') {
                    item.classList.add('sold');
                    const compradorNome = document.createElement('span');
                    compradorNome.classList.add('comprador');
                    compradorNome.textContent = rifaData[i].comprador;
                    item.appendChild(document.createElement('br'));
                    item.appendChild(compradorNome);
                    vendidosCount++;
                } else {
                    if (isAdminLoggedIn) {
                        item.classList.add('editable');
                        item.addEventListener('click', () => {
                            const nome = prompt(`Número ${i} - Quem comprou?`);
                            if (nome) {
                                rifaData[i] = { status: 'vendido', comprador: nome };
                                updateRaffleData(rifaData); // Chama a nova função para atualizar
                            }
                        });
                    }
                }
                gridContainer.appendChild(item);
            }
            
            vendidosCounter.textContent = vendidosCount;
            disponiveisCounter.textContent = totalNumbers - vendidosCount;

        } catch (error) {
            console.error('Erro ao carregar os dados da rifa:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os números da rifa. Tente novamente mais tarde.</p>';
        }
    };

    renderRaffle();
    setInterval(renderRaffle, 30000);
});
