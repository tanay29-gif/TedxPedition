import { Link } from "react-router-dom";
import "./SignIn.css";

function ThankYouPage() {
  return (
    <div className="signin-page">
      <div className="signin-card">
        <span className="signin-pill">Registration Complete</span>
        <h1>Thank you for registering your team.</h1>
        <p>
          Your team details have been saved successfully. We will review everything and
          get you ready for the event.
        </p>
        <div className="signin-success">
          Please wait for the next step and keep an eye on your email for further updates.
        </div>
        {/* <div className="signin-form">
          <Link to="/login" className="signin-button" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>
            Back to Sign In
          </Link>
        </div> */}
      </div>
    </div>
  );
}

export default ThankYouPage;
