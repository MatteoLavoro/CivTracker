// Auth Page - Login/Register
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock } from "lucide-react";
import { AuthLayout } from "../../components/layout";
import { Input, Button } from "../../components/common";
import { signIn, signUp } from "../../services/firebase";
import "./Auth.css";

/**
 * Authentication Page
 * Handles both login and registration
 */
export function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = "L'email è obbligatoria";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email non valida";
    }

    // Username validation (only for register)
    if (!isLogin && !formData.username) {
      errors.username = "Il nome utente è obbligatorio";
    } else if (!isLogin && formData.username.length < 3) {
      errors.username = "Il nome utente deve avere almeno 3 caratteri";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "La password è obbligatoria";
    } else if (formData.password.length < 6) {
      errors.password = "La password deve avere almeno 6 caratteri";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          setError(error);
          setLoading(false);
          return;
        }

        // Redirect to home on success
        navigate("/home");
      } else {
        // Register
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.username,
        );

        if (error) {
          setError(error);
          setLoading(false);
          return;
        }

        // Redirect to home on success
        navigate("/home");
      }
    } catch {
      setError("Si è verificato un errore. Riprova.");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setValidationErrors({});
    setFormData({ email: "", username: "", password: "" });
  };

  return (
    <AuthLayout
      title={isLogin ? "Bentornato" : "Crea Account"}
      subtitle={
        isLogin
          ? "Accedi al tuo account"
          : "Registrati per iniziare a tracciare la tua civiltà"
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          placeholder="tua.email@esempio.com"
          error={validationErrors.email}
          required
          icon={<Mail size={18} />}
        />

        {!isLogin && (
          <Input
            label="Nome Utente"
            type="text"
            value={formData.username}
            onChange={handleChange("username")}
            placeholder="Scegli un nome utente"
            error={validationErrors.username}
            required
            icon={<User size={18} />}
          />
        )}

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          placeholder="Inserisci la password"
          error={validationErrors.password}
          required
          icon={<Lock size={18} />}
        />

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {isLogin ? "Accedi" : "Crea Account"}
        </Button>

        <div className="auth-divider">
          <span>oppure</span>
        </div>

        <button
          type="button"
          onClick={toggleMode}
          className="auth-toggle"
          disabled={loading}
        >
          {isLogin ? (
            <>
              Non hai un account?{" "}
              <span className="auth-toggle-link">Registrati</span>
            </>
          ) : (
            <>
              Hai già un account?{" "}
              <span className="auth-toggle-link">Accedi</span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
