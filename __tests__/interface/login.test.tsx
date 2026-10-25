import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/src/app/login';
import { INVALID_CREDENTIALS } from '@/services/authService';

const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockSignIn = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ signIn: mockSignIn }) }));

const fillAndSubmit = async (email: string, password: string) => {
  await fireEvent.changeText(screen.getByPlaceholderText('seuemail@exemplo.com'), email);
  await fireEvent.changeText(screen.getByPlaceholderText('Digite sua senha'), password);
  await fireEvent.press(screen.getByText('Entrar'));
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Tela de login', () => {
  it('mostra os campos e as ações principais', async () => {
    await render(<LoginScreen />);

    expect(screen.getByText('Olá, bem-vindo(a)!')).toBeOnTheScreen();
    expect(screen.getByText('E-mail')).toBeOnTheScreen();
    expect(screen.getByText('Senha')).toBeOnTheScreen();
    expect(screen.getByText('Esqueci minha senha')).toBeOnTheScreen();
    expect(screen.getByText('Cadastrar')).toBeOnTheScreen();
  });

  it('valida os campos antes de chamar o back-end', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByText('Entrar'));

    expect(screen.getByText('Informe seu e-mail.')).toBeOnTheScreen();
    expect(screen.getByText('Informe sua senha.')).toBeOnTheScreen();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('login válido entra no app', async () => {
    mockSignIn.mockResolvedValueOnce(undefined);
    await render(<LoginScreen />);

    await fillAndSubmit('  ana@meupet.com ', 'senha123');

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/splash'));
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'ana@meupet.com', password: 'senha123' });
  });

  it('credenciais erradas mostram aviso', async () => {
    mockSignIn.mockRejectedValueOnce(new Error(INVALID_CREDENTIALS));
    await render(<LoginScreen />);

    await fillAndSubmit('ana@meupet.com', 'senhaerrada');

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeOnTheScreen();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('falha de servidor mostra mensagem genérica', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('timeout'));
    await render(<LoginScreen />);

    await fillAndSubmit('ana@meupet.com', 'senha123');

    expect(await screen.findByText('Não foi possível entrar. Tente novamente em instantes.')).toBeOnTheScreen();
  });

  it('botões levam para cadastro e recuperação de senha', async () => {
    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByPlaceholderText('seuemail@exemplo.com'), 'ana@meupet.com');
    await fireEvent.press(screen.getByText('Esqueci minha senha'));
    await fireEvent.press(screen.getByText('Cadastrar'));

    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/forgot-password', params: { email: 'ana@meupet.com' } });
    expect(mockRouter.push).toHaveBeenCalledWith('/cadastro');
  });
});
