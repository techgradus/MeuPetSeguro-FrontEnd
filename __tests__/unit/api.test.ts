import { api, ApiError, errorMessage, NetworkError, setUnauthorizedHandler } from '@/services/api';
import { session } from '@/services/session';

const mockFetch = (status: number, body: unknown) =>
  jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

afterEach(async () => {
  await session.clear();
  setUnauthorizedHandler(null);
});

describe('api()', () => {
  it('envia JSON e devolve o corpo da resposta', async () => {
    global.fetch = mockFetch(200, { ok: true });

    await expect(api('/pets', { method: 'POST', body: { name: 'Rex' } })).resolves.toEqual({ ok: true });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toMatch(/\/api\/pets$/);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ name: 'Rex' }));
  });

  it('manda o token salvo quando auth=true', async () => {
    await session.save('token-123', { id: '1', name: 'Ana', email: 'ana@x.com' });
    global.fetch = mockFetch(200, []);

    await api('/pets', { auth: true });

    expect((global.fetch as jest.Mock).mock.calls[0][1].headers.Authorization).toBe('Bearer token-123');
  });

  it('transforma erro HTTP em ApiError com a mensagem do back-end', async () => {
    global.fetch = mockFetch(409, { error: 'E-mail já cadastrado' });

    const error = (await api('/auth/register', { method: 'POST', body: {} }).catch((e) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(errorMessage(error)).toBe('E-mail já cadastrado');
  });

  it('em 401 autenticado limpa a sessão e avisa o app', async () => {
    await session.save('expirado', { id: '1', name: 'Ana', email: 'ana@x.com' });
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);
    global.fetch = mockFetch(401, { error: 'Token inválido ou expirado' });

    await expect(api('/pets', { auth: true })).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(await session.getToken()).toBeNull();
  });

  it('sem conexão lança NetworkError', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));

    const error = await api('/health').catch((e) => e);

    expect(error).toBeInstanceOf(NetworkError);
    expect(errorMessage(error)).toBe('Não foi possível conectar ao servidor.');
  });

  it('erro desconhecido usa a mensagem padrão', () => {
    expect(errorMessage(new Error('stack interno'))).toBe('Algo deu errado. Tente novamente.');
  });
});
