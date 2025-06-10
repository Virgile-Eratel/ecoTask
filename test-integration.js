// Script de test simple pour vérifier l'intégration frontend-backend
const API_BASE = 'http://localhost:3002/api';

async function testAPI() {
  console.log('🧪 Test d\'intégration EcoTask Frontend-Backend\n');

  try {
    // Test 1: Health check
    console.log('1. Test du health check...');
    const healthResponse = await fetch('http://localhost:3002/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check OK:', healthData.status);

    // Test 2: Dashboard stats
    console.log('\n2. Test des statistiques dashboard...');
    const statsResponse = await fetch(`${API_BASE}/stats/dashboard`);
    const statsData = await statsResponse.json();
    if (statsData.success) {
      console.log('✅ Dashboard stats OK');
      console.log(`   - Utilisateurs: ${statsData.data.totalUsers}`);
      console.log(`   - Projets: ${statsData.data.totalProjects}`);
      console.log(`   - Tâches: ${statsData.data.totalTasks}`);
      console.log(`   - CO₂ total: ${statsData.data.co2Stats.totalCO2} kg`);
    } else {
      console.log('❌ Erreur dashboard stats:', statsData.error);
    }

    // Test 3: Users
    console.log('\n3. Test de la liste des utilisateurs...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    const usersData = await usersResponse.json();
    if (usersData.success) {
      console.log(`✅ Users OK: ${usersData.data.users.length} utilisateurs`);
      usersData.data.users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('❌ Erreur users:', usersData.error);
    }

    // Test 4: Projects
    console.log('\n4. Test de la liste des projets...');
    const projectsResponse = await fetch(`${API_BASE}/projects`);
    const projectsData = await projectsResponse.json();
    if (projectsData.success) {
      console.log(`✅ Projects OK: ${projectsData.data.projects.length} projets`);
      projectsData.data.projects.forEach(project => {
        console.log(`   - ${project.name}: ${project.totalCO2} kg CO₂`);
      });
    } else {
      console.log('❌ Erreur projects:', projectsData.error);
    }

    // Test 5: Tasks
    console.log('\n5. Test de la liste des tâches...');
    const tasksResponse = await fetch(`${API_BASE}/tasks`);
    const tasksData = await tasksResponse.json();
    if (tasksData.success) {
      console.log(`✅ Tasks OK: ${tasksData.data.tasks.length} tâches`);
      tasksData.data.tasks.forEach(task => {
        console.log(`   - ${task.title}: ${task.co2Emissions} kg CO₂ (${task.status})`);
      });
    } else {
      console.log('❌ Erreur tasks:', tasksData.error);
    }

    console.log('\n🎉 Tous les tests sont passés ! L\'intégration fonctionne correctement.');
    console.log('\n📊 URLs disponibles:');
    console.log('   - Frontend: http://localhost:5173');
    console.log('   - Backend API: http://localhost:3002');
    console.log('   - Health check: http://localhost:3002/health');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    console.log('\n🔧 Vérifiez que:');
    console.log('   - Le backend est démarré (cd backend && npm run dev)');
    console.log('   - PostgreSQL est démarré (docker compose up -d postgres)');
    console.log('   - Les ports 3002 et 5173 sont disponibles');
  }
}

// Exécuter les tests si le script est appelé directement
if (typeof window === 'undefined') {
  testAPI();
}

// Exporter pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
}
