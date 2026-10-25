import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

describe('<Button />', () => {
  it('mostra o título e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Button title="Entrar" onPress={onPress} />);

    await fireEvent.press(screen.getByText('Entrar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('carregando: esconde o título e não aceita toque', async () => {
    const onPress = jest.fn();
    await render(<Button title="Entrar" onPress={onPress} loading />);

    expect(screen.queryByText('Entrar')).toBeNull();
    expect(screen.root).toBeDisabled();
    await fireEvent.press(screen.root!);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('<TextField />', () => {
  it('mostra o rótulo e repassa o texto digitado', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField label="E-mail" icon="mail-outline" placeholder="seuemail@exemplo.com" onChangeText={onChangeText} />,
    );

    expect(screen.getByText('E-mail')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByPlaceholderText('seuemail@exemplo.com'), 'ana@meupet.com');

    expect(onChangeText).toHaveBeenCalledWith('ana@meupet.com');
  });

  it('exibe a mensagem de erro', async () => {
    await render(<TextField label="E-mail" icon="mail-outline" error="Digite um e-mail válido." />);

    expect(screen.getByText('Digite um e-mail válido.')).toBeOnTheScreen();
  });

  it('campo de senha começa oculto e alterna ao tocar no olho', async () => {
    await render(<TextField label="Senha" icon="lock-closed-outline" placeholder="Digite sua senha" isPassword />);
    const input = screen.getByPlaceholderText('Digite sua senha');

    expect(input.props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByLabelText('Mostrar senha'));
    expect(input.props.secureTextEntry).toBe(false);
    expect(screen.getByLabelText('Ocultar senha')).toBeOnTheScreen();
  });
});
