/*
|--------------------------------------------------------------------------
| Expected Program
|--------------------------------------------------------------------------
*/

const expectedProgram = [
    {
        type: "ted",
        colour: "red",
        size: "extra_large",
        weight: "bold"
    },
    {
        type: "x",
        colour: "red",
        size: "large",
        weight: "normal"
    },
    {
        type: "iitgn",
        colour: "white",
        size: "medium",
        weight: "normal"
    }
];

/*
|--------------------------------------------------------------------------
| Validate Blockly Program
|--------------------------------------------------------------------------
*/

export function validateProgram(instructions) {

    // Must contain exactly 3 blocks
    if (instructions.length !== expectedProgram.length) {

        return {
            success: false,
            title: "Incorrect Number of Blocks",
            message: `Expected ${expectedProgram.length} blocks but found ${instructions.length}.`
        };

    }

    // Compare each block
    for (let i = 0; i < expectedProgram.length; i++) {

        const user = instructions[i];
        const expected = expectedProgram[i];

        // Block order
        if (user.type !== expected.type) {

            return {
                success: false,
                title: `Step ${i + 1} Incorrect`,
                message: `The ${ordinal(i + 1)} block should be "${formatType(expected.type)}".`
            };

        }

        // Colour
        if (user.colour !== expected.colour) {

            return {
                success: false,
                title: `Step ${i + 1} Incorrect`,
                message: `${formatType(expected.type)} should have colour "${capitalize(expected.colour)}".`
            };

        }

        // Size
        if (user.size !== expected.size) {

            return {
                success: false,
                title: `Step ${i + 1} Incorrect`,
                message: `${formatType(expected.type)} should use "${formatSize(expected.size)}".`
            };

        }

        // Weight
        if (user.weight !== expected.weight) {

            return {
                success: false,
                title: `Step ${i + 1} Incorrect`,
                message: `${formatType(expected.type)} should be "${capitalize(expected.weight)}".`
            };

        }

    }

    return {
        success: true,
        title: "Success",
        message: "TEDx logo restored successfully!"
    };

}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function capitalize(value) {

    return value.charAt(0).toUpperCase() + value.slice(1);

}

function formatType(type) {

    switch (type) {

        case "ted":
            return "TED";

        case "x":
            return "x";

        case "iitgn":
            return "IIT Gandhinagar";

        default:
            return type;

    }

}

function formatSize(size) {

    switch (size) {

        case "extra_large":
            return "Extra Large";

        case "large":
            return "Large";

        case "medium":
            return "Medium";

        case "small":
            return "Small";

        default:
            return size;

    }

}

function ordinal(number) {

    switch (number) {

        case 1:
            return "first";

        case 2:
            return "second";

        case 3:
            return "third";

        default:
            return `${number}th`;

    }

}