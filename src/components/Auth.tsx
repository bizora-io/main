import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Lock, Mail, Phone, MapPin, Building2, Store, Hash, ArrowRight, Loader2, MessageSquare, ChevronDown, Info, Shield } from 'lucide-react';

// Comprehensive Country List with Validation Regex
const COUNTRY_CODES = [
    { code: '+93', name: 'Afghanistan', regex: /^\d{9}$/ },
    { code: '+355', name: 'Albania', regex: /^\d{8,9}$/ },
    { code: '+213', name: 'Algeria', regex: /^\d{9,10}$/ },
    { code: '+1-684', name: 'American Samoa', regex: /^\d{7}$/ },
    { code: '+376', name: 'Andorra', regex: /^\d{6}$/ },
    { code: '+244', name: 'Angola', regex: /^\d{9}$/ },
    { code: '+1-264', name: 'Anguilla', regex: /^\d{7}$/ },
    { code: '+1-268', name: 'Antigua and Barbuda', regex: /^\d{7}$/ },
    { code: '+54', name: 'Argentina', regex: /^\d{10,11}$/ },
    { code: '+374', name: 'Armenia', regex: /^\d{8}$/ },
    { code: '+297', name: 'Aruba', regex: /^\d{7}$/ },
    { code: '+61', name: 'Australia', regex: /^\d{9}$/ },
    { code: '+43', name: 'Austria', regex: /^\d{10,13}$/ },
    { code: '+994', name: 'Azerbaijan', regex: /^\d{9}$/ },
    { code: '+1-242', name: 'Bahamas', regex: /^\d{7}$/ },
    { code: '+973', name: 'Bahrain', regex: /^\d{8}$/ },
    { code: '+880', name: 'Bangladesh', regex: /^1[3-9]\d{8}$/ }, // 10 digits omitting leading 0
    { code: '+1-246', name: 'Barbados', regex: /^\d{7}$/ },
    { code: '+375', name: 'Belarus', regex: /^\d{9}$/ },
    { code: '+32', name: 'Belgium', regex: /^\d{9}$/ },
    { code: '+501', name: 'Belize', regex: /^\d{7}$/ },
    { code: '+229', name: 'Benin', regex: /^\d{8}$/ },
    { code: '+1-441', name: 'Bermuda', regex: /^\d{7}$/ },
    { code: '+975', name: 'Bhutan', regex: /^\d{8}$/ },
    { code: '+591', name: 'Bolivia', regex: /^\d{8}$/ },
    { code: '+387', name: 'Bosnia and Herzegovina', regex: /^\d{8}$/ },
    { code: '+267', name: 'Botswana', regex: /^\d{7,8}$/ },
    { code: '+55', name: 'Brazil', regex: /^\d{10,11}$/ },
    { code: '+1-284', name: 'British Virgin Islands', regex: /^\d{7}$/ },
    { code: '+673', name: 'Brunei', regex: /^\d{7}$/ },
    { code: '+359', name: 'Bulgaria', regex: /^\d{8,9}$/ },
    { code: '+226', name: 'Burkina Faso', regex: /^\d{8}$/ },
    { code: '+257', name: 'Burundi', regex: /^\d{8}$/ },
    { code: '+855', name: 'Cambodia', regex: /^\d{8,9}$/ },
    { code: '+237', name: 'Cameroon', regex: /^\d{9}$/ },
    { code: '+1', name: 'Canada', regex: /^\d{10}$/ },
    { code: '+238', name: 'Cape Verde', regex: /^\d{7}$/ },
    { code: '+1-345', name: 'Cayman Islands', regex: /^\d{7}$/ },
    { code: '+236', name: 'Central African Republic', regex: /^\d{8}$/ },
    { code: '+235', name: 'Chad', regex: /^\d{8}$/ },
    { code: '+56', name: 'Chile', regex: /^\d{9}$/ },
    { code: '+86', name: 'China', regex: /^\d{11}$/ },
    { code: '+57', name: 'Colombia', regex: /^\d{10}$/ },
    { code: '+269', name: 'Comoros', regex: /^\d{7}$/ },
    { code: '+242', name: 'Congo', regex: /^\d{9}$/ },
    { code: '+243', name: 'DR Congo', regex: /^\d{9}$/ },
    { code: '+682', name: 'Cook Islands', regex: /^\d{5}$/ },
    { code: '+506', name: 'Costa Rica', regex: /^\d{8}$/ },
    { code: '+385', name: 'Croatia', regex: /^\d{8,9}$/ },
    { code: '+53', name: 'Cuba', regex: /^\d{8}$/ },
    { code: '+599', name: 'Curaçao', regex: /^\d{7,8}$/ },
    { code: '+357', name: 'Cyprus', regex: /^\d{8}$/ },
    { code: '+420', name: 'Czech Republic', regex: /^\d{9}$/ },
    { code: '+45', name: 'Denmark', regex: /^\d{8}$/ },
    { code: '+253', name: 'Djibouti', regex: /^\d{8}$/ },
    { code: '+1-767', name: 'Dominica', regex: /^\d{7}$/ },
    { code: '+1-809', name: 'Dominican Republic', regex: /^\d{7}$/ },
    { code: '+593', name: 'Ecuador', regex: /^\d{9}$/ },
    { code: '+20', name: 'Egypt', regex: /^\d{10,11}$/ },
    { code: '+503', name: 'El Salvador', regex: /^\d{8}$/ },
    { code: '+240', name: 'Equatorial Guinea', regex: /^\d{9}$/ },
    { code: '+291', name: 'Eritrea', regex: /^\d{7}$/ },
    { code: '+372', name: 'Estonia', regex: /^\d{7,8}$/ },
    { code: '+251', name: 'Ethiopia', regex: /^\d{9}$/ },
    { code: '+298', name: 'Faroe Islands', regex: /^\d{6}$/ },
    { code: '+679', name: 'Fiji', regex: /^\d{7}$/ },
    { code: '+358', name: 'Finland', regex: /^\d{5,12}$/ },
    { code: '+33', name: 'France', regex: /^\d{9}$/ },
    { code: '+594', name: 'French Guiana', regex: /^\d{9}$/ },
    { code: '+689', name: 'French Polynesia', regex: /^\d{6}$/ },
    { code: '+241', name: 'Gabon', regex: /^\d{7}$/ },
    { code: '+220', name: 'Gambia', regex: /^\d{7}$/ },
    { code: '+995', name: 'Georgia', regex: /^\d{9}$/ },
    { code: '+49', name: 'Germany', regex: /^\d{10,11}$/ },
    { code: '+233', name: 'Ghana', regex: /^\d{9}$/ },
    { code: '+350', name: 'Gibraltar', regex: /^\d{8}$/ },
    { code: '+30', name: 'Greece', regex: /^\d{10}$/ },
    { code: '+299', name: 'Greenland', regex: /^\d{6}$/ },
    { code: '+1-473', name: 'Grenada', regex: /^\d{7}$/ },
    { code: '+590', name: 'Guadeloupe', regex: /^\d{9}$/ },
    { code: '+1-671', name: 'Guam', regex: /^\d{7}$/ },
    { code: '+502', name: 'Guatemala', regex: /^\d{8}$/ },
    { code: '+224', name: 'Guinea', regex: /^\d{9}$/ },
    { code: '+245', name: 'Guinea-Bissau', regex: /^\d{7,9}$/ },
    { code: '+592', name: 'Guyana', regex: /^\d{7}$/ },
    { code: '+509', name: 'Haiti', regex: /^\d{8}$/ },
    { code: '+504', name: 'Honduras', regex: /^\d{8}$/ },
    { code: '+852', name: 'Hong Kong', regex: /^\d{8}$/ },
    { code: '+36', name: 'Hungary', regex: /^\d{9}$/ },
    { code: '+354', name: 'Iceland', regex: /^\d{7}$/ },
    { code: '+91', name: 'India', regex: /^\d{10}$/ },
    { code: '+62', name: 'Indonesia', regex: /^\d{9,12}$/ },
    { code: '+98', name: 'Iran', regex: /^\d{10}$/ },
    { code: '+964', name: 'Iraq', regex: /^\d{10}$/ },
    { code: '+353', name: 'Ireland', regex: /^\d{9}$/ },
    { code: '+972', name: 'Israel', regex: /^\d{9}$/ },
    { code: '+39', name: 'Italy', regex: /^\d{10}$/ },
    { code: '+1-876', name: 'Jamaica', regex: /^\d{7}$/ },
    { code: '+81', name: 'Japan', regex: /^\d{10}$/ },
    { code: '+962', name: 'Jordan', regex: /^\d{9}$/ },
    { code: '+7', name: 'Kazakhstan', regex: /^\d{10}$/ },
    { code: '+254', name: 'Kenya', regex: /^\d{9}$/ },
    { code: '+686', name: 'Kiribati', regex: /^\d{8}$/ },
    { code: '+383', name: 'Kosovo', regex: /^\d{8}$/ },
    { code: '+965', name: 'Kuwait', regex: /^\d{8}$/ },
    { code: '+996', name: 'Kyrgyzstan', regex: /^\d{9}$/ },
    { code: '+856', name: 'Laos', regex: /^\d{9,10}$/ },
    { code: '+371', name: 'Latvia', regex: /^\d{8}$/ },
    { code: '+961', name: 'Lebanon', regex: /^\d{7,8}$/ },
    { code: '+266', name: 'Lesotho', regex: /^\d{8}$/ },
    { code: '+231', name: 'Liberia', regex: /^\d{7,8}$/ },
    { code: '+218', name: 'Libya', regex: /^\d{9}$/ },
    { code: '+423', name: 'Liechtenstein', regex: /^\d{7}$/ },
    { code: '+370', name: 'Lithuania', regex: /^\d{8}$/ },
    { code: '+352', name: 'Luxembourg', regex: /^\d{9}$/ },
    { code: '+853', name: 'Macau', regex: /^\d{8}$/ },
    { code: '+389', name: 'Macedonia', regex: /^\d{8}$/ },
    { code: '+261', name: 'Madagascar', regex: /^\d{9}$/ },
    { code: '+265', name: 'Malawi', regex: /^\d{9}$/ },
    { code: '+60', name: 'Malaysia', regex: /^\d{9,10}$/ },
    { code: '+960', name: 'Maldives', regex: /^\d{7}$/ },
    { code: '+223', name: 'Mali', regex: /^\d{8}$/ },
    { code: '+356', name: 'Malta', regex: /^\d{8}$/ },
    { code: '+692', name: 'Marshall Islands', regex: /^\d{7}$/ },
    { code: '+222', name: 'Mauritania', regex: /^\d{8}$/ },
    { code: '+230', name: 'Mauritius', regex: /^\d{7,8}$/ },
    { code: '+52', name: 'Mexico', regex: /^\d{10}$/ },
    { code: '+691', name: 'Micronesia', regex: /^\d{7}$/ },
    { code: '+373', name: 'Moldova', regex: /^\d{8}$/ },
    { code: '+377', name: 'Monaco', regex: /^\d{8,9}$/ },
    { code: '+976', name: 'Mongolia', regex: /^\d{8}$/ },
    { code: '+382', name: 'Montenegro', regex: /^\d{8}$/ },
    { code: '+1-664', name: 'Montserrat', regex: /^\d{7}$/ },
    { code: '+212', name: 'Morocco', regex: /^\d{9}$/ },
    { code: '+258', name: 'Mozambique', regex: /^\d{9}$/ },
    { code: '+95', name: 'Myanmar', regex: /^\d{8,10}$/ },
    { code: '+264', name: 'Namibia', regex: /^\d{8,9}$/ },
    { code: '+674', name: 'Nauru', regex: /^\d{7}$/ },
    { code: '+977', name: 'Nepal', regex: /^\d{10}$/ },
    { code: '+31', name: 'Netherlands', regex: /^\d{9}$/ },
    { code: '+687', name: 'New Caledonia', regex: /^\d{6}$/ },
    { code: '+64', name: 'New Zealand', regex: /^\d{8,10}$/ },
    { code: '+505', name: 'Nicaragua', regex: /^\d{8}$/ },
    { code: '+227', name: 'Niger', regex: /^\d{8}$/ },
    { code: '+234', name: 'Nigeria', regex: /^\d{10}$/ },
    { code: '+683', name: 'Niue', regex: /^\d{4}$/ },
    { code: '+850', name: 'North Korea', regex: /^\d{8,10}$/ },
    { code: '+47', name: 'Norway', regex: /^\d{8}$/ },
    { code: '+968', name: 'Oman', regex: /^\d{8}$/ },
    { code: '+92', name: 'Pakistan', regex: /^\d{10}$/ },
    { code: '+680', name: 'Palau', regex: /^\d{7}$/ },
    { code: '+970', name: 'Palestine', regex: /^\d{9}$/ },
    { code: '+507', name: 'Panama', regex: /^\d{7,8}$/ },
    { code: '+675', name: 'Papua New Guinea', regex: /^\d{8}$/ },
    { code: '+595', name: 'Paraguay', regex: /^\d{9}$/ },
    { code: '+51', name: 'Peru', regex: /^\d{9}$/ },
    { code: '+63', name: 'Philippines', regex: /^\d{10}$/ },
    { code: '+48', name: 'Poland', regex: /^\d{9}$/ },
    { code: '+351', name: 'Portugal', regex: /^\d{9}$/ },
    { code: '+1-787', name: 'Puerto Rico', regex: /^\d{7}$/ },
    { code: '+974', name: 'Qatar', regex: /^\d{8}$/ },
    { code: '+40', name: 'Romania', regex: /^\d{9,10}$/ },
    { code: '+7', name: 'Russia', regex: /^\d{10}$/ },
    { code: '+250', name: 'Rwanda', regex: /^\d{9}$/ },
    { code: '+1-869', name: 'Saint Kitts and Nevis', regex: /^\d{7}$/ },
    { code: '+1-758', name: 'Saint Lucia', regex: /^\d{7}$/ },
    { code: '+1-784', name: 'Saint Vincent', regex: /^\d{7}$/ },
    { code: '+685', name: 'Samoa', regex: /^\d{5,7}$/ },
    { code: '+378', name: 'San Marino', regex: /^\d{6,10}$/ },
    { code: '+239', name: 'Sao Tome and Principe', regex: /^\d{7}$/ },
    { code: '+966', name: 'Saudi Arabia', regex: /^\d{9}$/ },
    { code: '+221', name: 'Senegal', regex: /^\d{9}$/ },
    { code: '+381', name: 'Serbia', regex: /^\d{8,9}$/ },
    { code: '+248', name: 'Seychelles', regex: /^\d{7}$/ },
    { code: '+232', name: 'Sierra Leone', regex: /^\d{8}$/ },
    { code: '+65', name: 'Singapore', regex: /^\d{8}$/ },
    { code: '+421', name: 'Slovakia', regex: /^\d{9}$/ },
    { code: '+386', name: 'Slovenia', regex: /^\d{8}$/ },
    { code: '+677', name: 'Solomon Islands', regex: /^\d{5,7}$/ },
    { code: '+252', name: 'Somalia', regex: /^\d{8,9}$/ },
    { code: '+27', name: 'South Africa', regex: /^\d{9}$/ },
    { code: '+82', name: 'South Korea', regex: /^\d{9,11}$/ },
    { code: '+211', name: 'South Sudan', regex: /^\d{9}$/ },
    { code: '+34', name: 'Spain', regex: /^\d{9}$/ },
    { code: '+94', name: 'Sri Lanka', regex: /^\d{9}$/ },
    { code: '+249', name: 'Sudan', regex: /^\d{9}$/ },
    { code: '+597', name: 'Suriname', regex: /^\d{6,7}$/ },
    { code: '+268', name: 'Swaziland', regex: /^\d{8}$/ },
    { code: '+46', name: 'Sweden', regex: /^\d{7,13}$/ },
    { code: '+41', name: 'Switzerland', regex: /^\d{9}$/ },
    { code: '+963', name: 'Syria', regex: /^\d{9}$/ },
    { code: '+886', name: 'Taiwan', regex: /^\d{9}$/ },
    { code: '+992', name: 'Tajikistan', regex: /^\d{9}$/ },
    { code: '+255', name: 'Tanzania', regex: /^\d{9}$/ },
    { code: '+66', name: 'Thailand', regex: /^\d{9}$/ },
    { code: '+670', name: 'Timor-Leste', regex: /^\d{7,8}$/ },
    { code: '+228', name: 'Togo', regex: /^\d{8}$/ },
    { code: '+676', name: 'Tonga', regex: /^\d{5,7}$/ },
    { code: '+1-868', name: 'Trinidad and Tobago', regex: /^\d{7}$/ },
    { code: '+216', name: 'Tunisia', regex: /^\d{8}$/ },
    { code: '+90', name: 'Turkey', regex: /^\d{10}$/ },
    { code: '+993', name: 'Turkmenistan', regex: /^\d{8}$/ },
    { code: '+1-649', name: 'Turks and Caicos', regex: /^\d{7}$/ },
    { code: '+688', name: 'Tuvalu', regex: /^\d{5}$/ },
    { code: '+256', name: 'Uganda', regex: /^\d{9}$/ },
    { code: '+380', name: 'Ukraine', regex: /^\d{9}$/ },
    { code: '+971', name: 'United Arab Emirates', regex: /^\d{9}$/ },
    { code: '+44', name: 'United Kingdom', regex: /^\d{10}$/ },
    { code: '+1', name: 'United States', regex: /^\d{10}$/ },
    { code: '+598', name: 'Uruguay', regex: /^\d{8}$/ },
    { code: '+998', name: 'Uzbekistan', regex: /^\d{9}$/ },
    { code: '+678', name: 'Vanuatu', regex: /^\d{5,7}$/ },
    { code: '+39', name: 'Vatican City', regex: /^\d{10}$/ },
    { code: '+58', name: 'Venezuela', regex: /^\d{10}$/ },
    { code: '+84', name: 'Vietnam', regex: /^\d{9,10}$/ },
    { code: '+967', name: 'Yemen', regex: /^\d{9}$/ },
    { code: '+260', name: 'Zambia', regex: /^\d{9}$/ },
    { code: '+263', name: 'Zimbabwe', regex: /^\d{9}$/ }
];

export const Auth: React.FC = () => {
  const { login, signup, complete2fa, socialLogin, recoverAccount, resetPassword } = useAuth();
  const { t } = useSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [is2faStep, setIs2faStep] = useState(false);
  const [isRecoveryStep, setIsRecoveryStep] = useState(false);
  const [recoveryVerificationStep, setRecoveryVerificationStep] = useState(false);

  // Login State
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [loginOtp, setLoginOtp] = useState('');

  // Recovery State
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPin, setNewPin] = useState('');

  // Signup State
  const [verificationStep, setVerificationStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [signupData, setSignupData] = useState({
    businessName: '',
    locationCount: 1,
    businessType: 'Retail',
    location: '',
    mobile: '',
    email: '',
    pin: ''
  });
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES.find(c => c.name === 'Bangladesh') || COUNTRY_CODES[0]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate delay
    const result = await login(identifier, pin, loginMethod === 'phone' ? 'PIN' : 'PASSWORD');
    
    if (result.success) {
        if (result.require2fa) {
            setIs2faStep(true);
        }
    } else {
        alert("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  const handle2faLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await complete2fa(loginOtp);
    if (!success) {
        alert("Invalid 2FA code. Please try again.");
    }
    setLoading(false);
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phone: string, country: typeof COUNTRY_CODES[0]) => {
      // If the selected country has a specific regex, use it
      if (country.regex) {
          // Note: Input is clean digits, regex should match full number without country code
          return country.regex.test(phone);
      }
      // Default fallback if no regex (6 to 15 digits)
      return /^\d{6,15}$/.test(phone);
  };

  const initiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.mobile) {
        alert("Mobile number is required for verification.");
        return;
    }

    // Strict Phone Validation
    const cleanMobile = signupData.mobile.replace(/\D/g, '').replace(/^0+/, ''); // Remove non-digits and leading zeros
    if (!validatePhoneNumber(cleanMobile, selectedCountry)) {
        alert(`Invalid phone number format for ${selectedCountry.name}.\nPlease enter a valid mobile number (e.g. for BD: 1712345678).`);
        return;
    }

    if (!signupData.email || !validateEmail(signupData.email)) {
        alert("Please enter a valid email address.");
        return;
    }

    setLoading(true);
    // Simulate sending OTP
    await new Promise(r => setTimeout(r, 1000)); 
    setVerificationStep(true);
    setLoading(false);
  };

  const completeSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (otp !== '1234') {
          alert("Invalid Verification Code. (Try 1234)");
          return;
      }
      setLoading(true);
      // Clean mobile again just in case
      const cleanMobile = signupData.mobile.replace(/\D/g, '').replace(/^0+/, '');
      await signup({ ...signupData, mobile: `${selectedCountry.code}${cleanMobile}` });
      setLoading(false);
  };

  const handleInitiateRecovery = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const success = await recoverAccount(recoveryIdentifier);
      if (success) {
          setRecoveryVerificationStep(true);
      }
      setLoading(false);
  };

  const handleResetPin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const success = await resetPassword(recoveryIdentifier, recoveryOtp, newPin);
      if (success) {
          alert("PIN successfully reset. You can now login.");
          setIsRecoveryStep(false);
          setRecoveryVerificationStep(false);
          setIsLogin(true);
      } else {
          alert("Invalid recovery code. Please try again.");
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Hero / Branding */}
        <div className="w-full md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90 z-0"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20 z-0"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-2xl mb-6">B</div>
            <h1 className="text-4xl font-bold mb-4">Bizora</h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Empowering businesses with AI-driven insights, seamless inventory control, and next-gen accounting.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Store className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="font-semibold">Multi-Store Management</p>
                <p className="text-xs text-indigo-200">Sync stock across locations instantly.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <Lock className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="font-semibold">Secure Access</p>
                <p className="text-xs text-indigo-200">Phone or Email + PIN authentication.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white relative">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {isRecoveryStep 
                  ? (recoveryVerificationStep ? 'Reset PIN' : 'Recover Account')
                  : isLogin 
                    ? (is2faStep ? 'Two-Factor Auth' : t('Sign In')) 
                    : (verificationStep ? 'Verify Mobile' : t('Create Account'))}
              </h2>
              <p className="text-slate-500 text-sm">
                {isRecoveryStep
                  ? (recoveryVerificationStep 
                      ? 'Enter the code sent to you and choose a new PIN.' 
                      : 'Enter your email or phone to receive a recovery code.')
                  : isLogin 
                    ? (is2faStep 
                        ? 'Enter the 2FA code from your authenticator app.' 
                        : 'Welcome back! Please enter your details.')
                    : (verificationStep 
                        ? `Enter the code sent to ${selectedCountry.code} ${signupData.mobile}` 
                        : 'Start your journey with Bizora today.')}
              </p>
            </div>

            {isRecoveryStep ? (
              recoveryVerificationStep ? (
                // RESET PIN FORM
                <form onSubmit={handleResetPin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Recovery Code</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={recoveryOtp}
                        onChange={(e) => setRecoveryOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        placeholder="1234"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New PIN</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        placeholder="Enter new PIN"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset PIN"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRecoveryVerificationStep(false)}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    Back
                  </button>
                </form>
              ) : (
                // INITIATE RECOVERY FORM
                <form onSubmit={handleInitiateRecovery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email or Phone Number</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                        placeholder="Enter your email or phone"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Recovery Code"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsRecoveryStep(false)}
                    className="w-full text-sm text-slate-500 hover:text-slate-700"
                  >
                    Back to Login
                  </button>
                </form>
              )
            ) : isLogin ? (
              is2faStep ? (
                // 2FA LOGIN FORM
                <form onSubmit={handle2faLogin} className="space-y-6">
                    <div>
                        <label className="block text-center text-sm font-bold text-slate-500 uppercase mb-4">Verification Code</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={loginOtp}
                                onChange={(e) => setLoginOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                placeholder="1234"
                                maxLength={4}
                                required
                            />
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-2">Hint: Use 1234 for testing</p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setIs2faStep(false)}
                        className="w-full text-sm text-slate-500 hover:text-slate-700"
                    >
                        Back to Login
                    </button>
                </form>
              ) : (
                // LOGIN FORM
                <form onSubmit={handleLogin} className="space-y-4">
                {/* Method Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                  >
                    Phone / ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                  >
                    Email
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {loginMethod === 'phone' ? t('Phone Number / User ID') : t('Email')}
                  </label>
                  <div className="relative">
                    {loginMethod === 'phone' ? (
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    ) : (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    )}
                    <input
                      type={loginMethod === 'phone' ? 'text' : 'email'} 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 transition-colors"
                      placeholder={loginMethod === 'phone' ? 'Enter mobile number or ID' : 'name@company.com'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('PIN Code')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 transition-colors"
                      placeholder="****"
                      maxLength={12} 
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setIsRecoveryStep(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot PIN/Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {t('Login')} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => socialLogin('google')} className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                  </button>
                  <button type="button" onClick={() => socialLogin('facebook')} className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="w-5 h-5" referrerPolicy="no-referrer" />
                  </button>
                  <button type="button" onClick={() => socialLogin('apple')} className="flex items-center justify-center py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/apple.svg" alt="Apple" className="w-5 h-5" referrerPolicy="no-referrer" />
                  </button>
                </div>
              </form>
            )) : verificationStep ? (
                // VERIFICATION FORM
                <form onSubmit={completeSignup} className="space-y-6">
                    <div>
                        <label className="block text-center text-sm font-bold text-slate-500 uppercase mb-4">One-Time Password (OTP)</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                                placeholder="1234"
                                maxLength={4}
                                required
                            />
                        </div>
                        <p className="text-xs text-center text-slate-400 mt-2">Hint: Use 1234 for testing</p>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Create Account"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => setVerificationStep(false)}
                        className="w-full text-sm text-slate-500 hover:text-slate-700"
                    >
                        Back to Details
                    </button>
                </form>
            ) : (
              // SIGNUP FORM
              <form onSubmit={initiateSignup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Business Name')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={signupData.businessName}
                      onChange={(e) => setSignupData({...signupData, businessName: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Business Type')}</label>
                    <select
                      value={signupData.businessType}
                      onChange={(e) => setSignupData({...signupData, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Retail</option>
                      <option>Wholesale</option>
                      <option>Service</option>
                      <option>Manufacturing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Number of Locations')}</label>
                    <input
                      type="number"
                      min="1"
                      value={signupData.locationCount}
                      onChange={(e) => setSignupData({...signupData, locationCount: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Location')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={signupData.location}
                      onChange={(e) => setSignupData({...signupData, location: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="City, Address"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Mobile Number')}</label>
                    <div className="flex rounded-lg shadow-sm">
                        {/* Custom Country Selector with Invisible Overlay */}
                        <div className="relative flex items-center border-y border-l border-slate-200 rounded-l-lg bg-slate-50 w-[85px]">
                            {/* Display Value - Updates on Selection */}
                            <div className="flex items-center justify-between w-full px-2 pointer-events-none">
                                <span className="text-sm font-medium text-slate-700 truncate">{selectedCountry.code}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </div>
                            
                            {/* Invisible Select - Overlays the visual part */}
                            <select
                                value={selectedCountry.name}
                                onChange={(e) => {
                                    const c = COUNTRY_CODES.find(cnt => cnt.name === e.target.value);
                                    if(c) setSelectedCountry(c);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                                title="Select Country"
                            >
                                {COUNTRY_CODES.map((c) => (
                                    <option key={c.name} value={c.name}>
                                        {c.code} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input
                            type="tel"
                            value={signupData.mobile}
                            onChange={(e) => setSignupData({...signupData, mobile: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-r-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 -ml-px z-0"
                            placeholder="1712345678"
                            required
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('Email')}</label>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t('PIN Code')}</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      maxLength={6}
                      value={signupData.pin}
                      onChange={(e) => setSignupData({...signupData, pin: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Create a PIN"
                      required
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Info className="w-3 h-3" />
                      <span>Create a secure 4-6 digit PIN for quick login.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Sign Up')}
                </button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {isLogin ? t('Don\'t have an account?') : t('Already have an account?')}
                <button
                  onClick={() => { 
                      setIsLogin(!isLogin); 
                      setVerificationStep(false); 
                      setIs2faStep(false); 
                      setIsRecoveryStep(false);
                      setRecoveryVerificationStep(false);
                  }}
                  className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {isLogin ? t('Sign Up') : t('Login')}
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};