import classes from './Modal.module.scss'
import { useModalContext } from '@/context/ModalContext'
import IconClose from '@/svgs/close.svg'
import CreateAccountForm from '@/components/Forms/CreateAccountForm'
import LoginAccountForm from '@/components/Forms/LoginAccountForm'
import ForgotPasswordForm from '@/components/Forms/ForgotPasswordForm'

const Modal = ({props, children}) => {

  const modalContext = useModalContext()

  const getContent = (type, children) => {
    switch(type) {
      case 'create':
        return <CreateAccountForm />
      case 'login':
        return <LoginAccountForm />
      case 'forgot_password':
        return <ForgotPasswordForm />
      default:
        return children
    }
  }

  return (
    <div className={classes['modal']}>
      <div
        onClick={() => modalContext.setIsOpen(false)}
        className={classes['modal__overlay']}>
      </div>
      <div className={classes['modal__content']}>
        <div className={classes['modal__content-container']}>
          <button
            onClick={() => modalContext.setIsOpen(false)}
            className={classes['modal__close-btn']}>
            <IconClose />
          </button>
          {getContent(modalContext.modalType, children)}
        </div>
      </div>
    </div>
  )
}

export default Modal