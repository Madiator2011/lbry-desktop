// @flow
import React from 'react';
import { Form, FormRow, FormField } from 'component/common/form';
import { Modal } from 'modal/modal';
import Button from 'component/button';

type Props = {
  closeModal: () => void,
  walletEncryptSucceded: boolean,
  updateWalletStatus: boolean,
  encryptWallet: string => void,
  updateWalletStatus: () => void,
};

type State = {
  newPassword: ?string,
  newPasswordConfirm: ?string,
  passwordMismatch: boolean,
  understandConfirmed: boolean,
  understandError: boolean,
  submitted: boolean,
  failMessage: boolean,
};

class ModalWalletEncrypt extends React.PureComponent<Props, State> {
  state = {
    newPassword: null,
    newPasswordConfirm: null,
    passwordMismatch: false,
    understandConfirmed: false,
    understandError: false,
    submitted: false, // Prior actions could be marked complete
    failMessage: false,
  };

  componentDidUpdate() {
    const { props, state } = this;

    if (state.submitted) {
      if (props.walletEncryptSucceded === true) {
        props.closeModal();
        props.updateWalletStatus();
      } else if (props.walletEncryptSucceded === false) {
        // See https://github.com/lbryio/lbry/issues/1307
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ failMessage: 'Unable to encrypt wallet.' });
      }
    }
  }

  onChangeNewPassword(event: SyntheticInputEvent<>) {
    this.setState({ newPassword: event.target.value });
  }

  onChangeNewPasswordConfirm(event: SyntheticInputEvent<>) {
    this.setState({ newPasswordConfirm: event.target.value });
  }

  onChangeUnderstandConfirm(event: SyntheticInputEvent<>) {
    this.setState({
      understandConfirmed: /^.?i understand.?$/i.test(event.target.value),
    });
  }

  submitEncryptForm() {
    const { state } = this;

    let invalidEntries = false;

    if (state.newPassword !== state.newPasswordConfirm) {
      this.setState({ passwordMismatch: true });
      invalidEntries = true;
    }

    if (state.understandConfirmed === false) {
      this.setState({ understandError: true });
      invalidEntries = true;
    }

    if (invalidEntries === true) {
      return;
    }

    this.setState({ submitted: true });
    this.props.encryptWallet(state.newPassword);
  }

  render() {
    const { closeModal } = this.props;

    const { passwordMismatch, understandError, failMessage } = this.state;

    return (
      <Modal
        isOpen
        title={__('Encrypt Wallet')}
        contentLabel={__('Encrypt Wallet')}
        type="confirm"
        confirmButtonLabel={__('Encrypt Wallet')}
        abortButtonLabel={__('Cancel')}
        onConfirmed={() => this.submitEncryptForm()}
        onAborted={closeModal}
      >
        <Form onSubmit={() => this.submitEncryptForm()}>
          <section className="card__content">
            <p>
              {__(
                'Encrypting your wallet will require a password to access your local wallet data when LBRY starts. Please enter a new password for your wallet.'
              )}{' '}
              <Button
                button="link"
                label={__('Learn more')}
                href="https://lbry.io/faq/wallet-encryption"
              />.
            </p>
            <FormRow padded>
              <FormField
                stretch
                autoFocus
                error={passwordMismatch === true ? 'Passwords do not match' : false}
                label={__('Password')}
                type="password"
                name="wallet-new-password"
                onChange={event => this.onChangeNewPassword(event)}
              />
            </FormRow>
            <FormRow padded>
              <FormField
                stretch
                error={passwordMismatch === true ? 'Passwords do not match' : false}
                label={__('Confirm Password')}
                type="password"
                name="wallet-new-password-confirm"
                onChange={event => this.onChangeNewPasswordConfirm(event)}
              />
            </FormRow>
          </section>
          <section className="card__content">
            <p>
              {__(
                'If your password is lost, it cannot be recovered. You will not be able to access your wallet without a password.'
              )}
            </p>
            <FormRow padded>
              <FormField
                stretch
                error={understandError === true ? 'You must enter "I understand"' : false}
                label={__('Enter "I understand"')}
                type="text"
                name="wallet-understand"
                onChange={event => this.onChangeUnderstandConfirm(event)}
              />
            </FormRow>
            <div className="card__actions" />
            {failMessage && <div className="error-text">{__(failMessage)}</div>}
          </section>
        </Form>
      </Modal>
    );
  }
}

export default ModalWalletEncrypt;
