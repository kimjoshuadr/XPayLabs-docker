export default {
  // Route internationalization
  route: {
    dashboard: 'Dashboard',
    document: 'Project Docs'
  },
  // Login page i18n
  login: {
    selectPlaceholder: 'Please select/enter company name',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logging: 'Logging in...',
    code: 'Verification Code',
    rememberPassword: 'Remember Me',
    switchRegisterPage: 'Register Now',
    rule: {
      tenantId: {
        required: 'Please enter your tenant ID'
      },
      username: {
        required: 'Please enter your account'
      },
      password: {
        required: 'Please enter your password'
      },
      code: {
        required: 'Please enter verification code'
      }
    },
    social: {
      wechat: 'WeChat Login',
      maxkey: 'MaxKey Login',
      topiam: 'TopIam Login',
      gitee: 'Gitee Login',
      github: 'GitHub Login'
    }
  },
  // Registration page internationalization
  register: {
    selectPlaceholder: 'Please select/enter company name',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    register: 'Register',
    registering: 'Registering...',
    registerSuccess: 'Congratulations, your account {username} has been registered successfully!',
    code: 'Verification Code',
    switchLoginPage: 'Sign in with an existing account',
    rule: {
      tenantId: {
        required: 'Please enter your tenant ID'
      },
      username: {
        required: 'Please enter your account',
        length: 'User account length must be between {min} and {max}'
      },
      password: {
        required: 'Please enter your password',
        length: 'User password length must be between {min} and {max}',
        pattern: 'Cannot contain illegal characters: {strings}'
      },
      code: {
        required: 'Please enter verification code'
      },
      confirmPassword: {
        required: 'Please enter your password again',
        equalToPassword: 'The two passwords do not match'
      }
    }
  },
  // Navbar internationalization
  navbar: {
    full: 'Fullscreen',
    language: 'Language',
    dashboard: 'Dashboard',
    document: 'Project Docs',
    message: 'Message',
    layoutSize: 'Layout Size',
    selectTenant: 'Select Tenant',
    layoutSetting: 'Layout Settings',
    personalCenter: 'Profile',
    logout: 'Logout'
  }
};
