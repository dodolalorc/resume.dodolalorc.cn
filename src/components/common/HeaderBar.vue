<template>
  <header class="header">
    <div class="container">
      <div class="left-section">
        <p class="subtitle">resume builder</p>
        <h1 class="title">resume.dodolalorc.cn</h1>
      </div>
      <div class="right-section">
        <span class="badge">Editable</span>
        <a
          class="github-link"
          href="https://github.com/dodolalorc/resume.dodolalorc.cn"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⭐️ GitHub · Star if you like
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  background: linear-gradient(to right, #0f172a, #1e293b, #0f172a);
  color: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.container {
  margin: 0 auto;
  display: flex;
  width: 100%;
  max-width: 72rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}

.left-section {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #cbd5e1;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  border-radius: 9999px;
  background-color: rgba(34, 197, 94, 0.2);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a7f3d0;
}

.github-link {
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f1f5f9;
  transition: background-color 0.2s;
  text-decoration: none;
}

.github-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
