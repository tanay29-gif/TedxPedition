import "./HowItWorks.css";

const steps = [
    {
        number: "01",
        title: "Sign In",
        description:
            "Sign in using your IIT Gandhinagar Google account. Team leaders will automatically access their registered team."
    },
    {
        number: "02",
        title: "Reach Your Stall",
        description:
            "Go to your assigned stall and begin your TEDxPedition journey."
    },
    {
        number: "03",
        title: "Scan the QR Code",
        description:
            "Scan the QR code placed at the stall to unlock the challenge."
    },
    {
        number: "04",
        title: "Solve & Advance",
        description:
            "Complete the challenge, earn points, and move on to the next stall."
    }
];
export default function HowItWorks() {
    return (
        <section className="howItWorks" id="about">

            <div className="sectionHeading">
                <h2>How It Works</h2>
                <p>
                    Four simple steps to begin your TEDxPedition journey.
                </p>
            </div>

            <div className="stepsContainer">

                {steps.map((step) => (
                    <div className="stepCard" key={step.number}>

                        <div className="stepNumber">
                            {step.number}
                        </div>

                        <h3>{step.title}</h3>

                        <p>{step.description}</p>

                    </div>
                ))}

            </div>

        </section>
    );
}