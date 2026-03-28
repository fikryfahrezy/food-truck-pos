import { ref } from "vue";
import { useRouter } from "#imports";
import { useAuth } from "~/composables/useAuth";

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  const username = ref("");
  const loading = ref(false);
  const error = ref("");

  async function handleLogin() {
    if (!username.value.trim()) return;
    loading.value = true;
    error.value = "";
    try {
      await login(username.value.trim());
      router.push("/pin");
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } };
      error.value = err.data?.message ?? "Username tidak ditemukan";
    } finally {
      loading.value = false;
    }
  }

  return { username, loading, error, handleLogin };
}
