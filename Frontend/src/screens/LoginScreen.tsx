import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Phone,
  Lock,
  User as UserIcon,
  Building,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    sendOtp,
    login,
    register,
    t,
    language,
    setLanguage
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');

  // Login states
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regLang, setRegLang] = useState<'en' | 'hi'>(language);

  // -----------------------------------
  // SEND OTP
  // -----------------------------------

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !/^\d{10}$/.test(phone)) {
      setOtpError(
        language === 'en'
          ? 'Please enter a valid 10-digit mobile number'
          : 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें'
      );
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const success = await sendOtp(phone);

      if (!success) {
        setOtpError(
          language === 'en'
            ? 'Failed to send OTP'
            : 'OTP भेजने में विफल'
        );
        return;
      }

      // Move to OTP screen only after backend accepts the request
      setStep('otp');
    } catch (error) {
      console.error('Send OTP error:', error);

      setOtpError(
        language === 'en'
          ? 'Something went wrong. Please try again.'
          : 'कुछ गलत हुआ। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------
  // VERIFY OTP
  // -----------------------------------

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !/^\d{4}$/.test(otp)) {
      setOtpError(
        language === 'en'
          ? 'Please enter a 4-digit OTP'
          : 'कृपया 4 अंकों का OTP दर्ज करें'
      );
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const success = await login(phone, otp);

      if (!success) {
        setOtpError(
          language === 'en'
            ? 'Invalid OTP'
            : 'अमान्य OTP'
        );
      }
    } catch (error) {
      console.error('Login error:', error);

      setOtpError(
        language === 'en'
          ? 'Login failed. Please try again.'
          : 'लॉगिन विफल हुआ। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------
  // REGISTER
  // -----------------------------------

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName || !regBusiness || !regPhone) {
      setOtpError(
        language === 'en'
          ? 'Please fill in all required fields'
          : 'कृपया सभी आवश्यक फ़ील्ड भरें'
      );
      return;
    }

    if (!/^\d{10}$/.test(regPhone)) {
      setOtpError(
        language === 'en'
          ? 'Please enter a valid 10-digit mobile number'
          : 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें'
      );
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const success = await register({
        name: regName,
        businessName: regBusiness,
        phone: regPhone,
        language: regLang,
        location: regLocation || 'India'
      });

      if (!success) {
        setOtpError(
          language === 'en'
            ? 'Registration failed. Please try again.'
            : 'पंजीकरण विफल हुआ। कृपया फिर से प्रयास करें।'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);

      setOtpError(
        language === 'en'
          ? 'Registration failed. Please try again.'
          : 'पंजीकरण विफल हुआ। कृपया फिर से प्रयास करें।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <div
      className="app-screen-container no-nav"
      style={{
        padding: '24px 20px',
        background: '#fdfbf7'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          textAlign: 'center',
          margin: '20px 0 30px'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
            margin: '0 auto 12px',
            boxShadow: '0 8px 24px rgba(60, 110, 113, 0.3)'
          }}
        >
          <img
            src="/kalakart-logo.jpeg"
            alt="Kalakart logo"
            style={{
              position: 'absolute',
              width: '100px',
              height: 'auto',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: 'none'
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '28px',
            color: '#3C6E71',
            fontWeight: 800
          }}
        >
          Kalakart
        </h1>

        <p
          style={{
            color: '#6e625a',
            fontSize: '14px',
            marginTop: '4px'
          }}
        >
          {t('tagline')}
        </p>

        {/* Language selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px'
          }}
        >
          <button
            type="button"
            onClick={() => setLanguage('en')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border:
                language === 'en'
                  ? '2px solid #3C6E71'
                  : '1px solid #e8ded5',
              background:
                language === 'en'
                  ? '#fef3c7'
                  : '#ffffff',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            English
          </button>

          <button
            type="button"
            onClick={() => setLanguage('hi')}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border:
                language === 'hi'
                  ? '2px solid #3C6E71'
                  : '1px solid #e8ded5',
              background:
                language === 'hi'
                  ? '#fef3c7'
                  : '#ffffff',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* LOGIN */}
      {!isRegistering ? (
        <div
          className="card"
          style={{
            padding: '24px'
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              textAlign: 'center'
            }}
          >
            {t('welcomeBack')} 👋
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              textAlign: 'center',
              marginBottom: '20px'
            }}
          >
            {step === 'mobile'
              ? language === 'en'
                ? 'Log in to manage your artisan listings'
                : 'अपनी कारीगर लिस्टिंग प्रबंधित करने के लिए लॉगिन करें'
              : language === 'en'
                ? `OTP sent to +91 ${phone}`
                : `+91 ${phone} पर OTP भेजा गया`}
          </p>

          {/* Error */}
          {otpError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {otpError}
            </div>
          )}

          {/* MOBILE STEP */}
          {step === 'mobile' ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>
                  {t('enterMobile')}
                </label>

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 600,
                      color: '#6e625a'
                    }}
                  >
                    +91
                  </span>

                  <input
                    type="tel"
                    id="mobile-input"
                    className="form-control"
                    style={{
                      paddingLeft: '50px'
                    }}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 10)
                      )
                    }
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-send-otp"
                className="btn-primary"
                style={{
                  marginTop: '10px'
                }}
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? language === 'en'
                      ? 'Sending...'
                      : 'भेजा जा रहा है...'
                    : t('sendOtp')}
                </span>

                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            /* OTP STEP */
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>
                  {t('enterOtp')}
                </label>

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6e625a'
                    }}
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    id="otp-input"
                    className="form-control"
                    style={{
                      paddingLeft: '44px',
                      letterSpacing: '4px',
                      fontSize: '18px',
                      fontWeight: 700
                    }}
                    placeholder="1234"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 4)
                      )
                    }
                    maxLength={4}
                    autoFocus
                    required
                  />
                </div>

                <span
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '6px'
                  }}
                >
                  💡 {t('otpHint')}
                </span>
              </div>

              <button
                type="submit"
                id="btn-verify-otp"
                className="btn-primary"
                style={{
                  marginTop: '10px'
                }}
                disabled={isLoading}
              >
                <CheckCircle size={18} />

                <span>
                  {isLoading
                    ? language === 'en'
                      ? 'Verifying...'
                      : 'सत्यापित किया जा रहा है...'
                    : t('verifyAndLogin')}
                </span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  marginTop: '12px'
                }}
                onClick={() => {
                  setStep('mobile');
                  setOtp('');
                  setOtpError('');
                }}
                disabled={isLoading}
              >
                {t('back')}
              </button>
            </form>
          )}

          {/* CREATE ACCOUNT */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e8ded5'
            }}
          >
            <p
              style={{
                fontSize: '14px',
                color: '#6e625a'
              }}
            >
              {language === 'en'
                ? 'New to Kalakart?'
                : 'शिल्पओरा पर नए हैं?'}
            </p>

            <button
              type="button"
              id="btn-create-account-toggle"
              style={{
                background: 'none',
                border: 'none',
                color: '#3C6E71',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '4px'
              }}
              onClick={() => {
                setIsRegistering(true);
                setOtpError('');
              }}
            >
              {t('createAccount')}
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION */
        <div
          className="card"
          style={{
            padding: '24px'
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              marginBottom: '6px',
              textAlign: 'center'
            }}
          >
            {t('createAccount')}
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#6e625a',
              textAlign: 'center',
              marginBottom: '20px'
            }}
          >
            {language === 'en'
              ? 'Register your artisan craft business'
              : 'अपना हस्तशिल्प व्यवसाय पंजीकृत करें'}
          </p>

          {otpError && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {otpError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            {/* NAME */}
            <div className="form-group">
              <label>
                {t('artisanName')} *
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <UserIcon
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6e625a'
                  }}
                />

                <input
                  type="text"
                  id="reg-name"
                  className="form-control"
                  style={{
                    paddingLeft: '44px'
                  }}
                  placeholder="e.g. Rameshwar Ram"
                  value={regName}
                  onChange={(e) =>
                    setRegName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* BUSINESS */}
            <div className="form-group">
              <label>
                {t('businessName')} *
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <Building
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6e625a'
                  }}
                />

                <input
                  type="text"
                  id="reg-business"
                  className="form-control"
                  style={{
                    paddingLeft: '44px'
                  }}
                  placeholder="e.g. Banaras Handloom Craft"
                  value={regBusiness}
                  onChange={(e) =>
                    setRegBusiness(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label>
                {t('mobileNumber')} *
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <Phone
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6e625a'
                  }}
                />

                <input
                  type="tel"
                  inputMode="numeric"
                  id="reg-phone"
                  className="form-control"
                  style={{
                    paddingLeft: '44px'
                  }}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) =>
                    setRegPhone(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10)
                    )
                  }
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label>
                {t('location')}
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <MapPin
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6e625a'
                  }}
                />

                <input
                  type="text"
                  id="reg-location"
                  className="form-control"
                  style={{
                    paddingLeft: '44px'
                  }}
                  placeholder="e.g. Varanasi, UP"
                  value={regLocation}
                  onChange={(e) =>
                    setRegLocation(e.target.value)
                  }
                />
              </div>
            </div>

            {/* LANGUAGE */}
            <div className="form-group">
              <label>
                {t('preferredLanguage')}
              </label>

              <select
                id="reg-language"
                className="form-control"
                value={regLang}
                onChange={(e) =>
                  setRegLang(
                    e.target.value as 'en' | 'hi'
                  )
                }
              >
                <option value="en">
                  English
                </option>

                <option value="hi">
                  हिंदी (Hindi)
                </option>
              </select>
            </div>

            {/* REGISTER */}
            <button
              type="submit"
              id="btn-register-submit"
              className="btn-primary"
              style={{
                marginTop: '16px'
              }}
              disabled={isLoading}
            >
              <Sparkles size={18} />

              <span>
                {isLoading
                  ? language === 'en'
                    ? 'Creating...'
                    : 'बनाया जा रहा है...'
                  : t('registerBtn')}
              </span>
            </button>

            {/* BACK TO LOGIN */}
            <button
              type="button"
              className="btn-secondary"
              style={{
                marginTop: '12px'
              }}
              onClick={() => {
                setIsRegistering(false);
                setOtpError('');
              }}
              disabled={isLoading}
            >
              {t('alreadyHaveAccount')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

