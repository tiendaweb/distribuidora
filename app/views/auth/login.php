<div class="flex-1 bg-gray-100 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow p-6 w-full max-w-sm">
    <h1 class="font-display text-3xl mb-4">Login</h1>
    <form class="space-y-3" onsubmit="event.preventDefault(); window.location.href='/admin';">
      <input type="email" required placeholder="Email" class="w-full border rounded px-3 py-2">
      <input type="password" required placeholder="Contraseña" class="w-full border rounded px-3 py-2">
      <button class="w-full bg-blue-600 text-white font-bold py-2 rounded">Ingresar</button>
    </form>
  </div>
</div>
