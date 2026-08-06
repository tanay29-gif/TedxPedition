import { javascriptGenerator } from "blockly/javascript";

/* -------------------------------------------------------------------------- */
/*                                  TED Block                                 */
/* -------------------------------------------------------------------------- */

javascriptGenerator.forBlock["ted_text"] = function (block) {

    const colour = block.getFieldValue("COLOUR");
    const size = block.getFieldValue("SIZE");
    const weight = block.getFieldValue("WEIGHT");

    return `
instructions.push({
    type: "ted",
    colour: "${colour}",
    size: "${size}",
    weight: "${weight}"
});
`;

};


/* -------------------------------------------------------------------------- */
/*                                   x Block                                  */
/* -------------------------------------------------------------------------- */

javascriptGenerator.forBlock["ted_x"] = function (block) {

    const colour = block.getFieldValue("COLOUR");
    const size = block.getFieldValue("SIZE");
    const weight = block.getFieldValue("WEIGHT");

    return `
instructions.push({
    type: "x",
    colour: "${colour}",
    size: "${size}",
    weight: "${weight}"
});
`;

};


/* -------------------------------------------------------------------------- */
/*                             IIT Gandhinagar Block                          */
/* -------------------------------------------------------------------------- */

javascriptGenerator.forBlock["iitgn_text"] = function (block) {

    const colour = block.getFieldValue("COLOUR");
    const size = block.getFieldValue("SIZE");
    const weight = block.getFieldValue("WEIGHT");

    return `
instructions.push({
    type: "iitgn",
    colour: "${colour}",
    size: "${size}",
    weight: "${weight}"
});
`;

};


/* -------------------------------------------------------------------------- */
/*                        Workspace -> Instructions                           */
/* -------------------------------------------------------------------------- */

export function generateInstructions(workspace) {

    const code = javascriptGenerator.workspaceToCode(workspace);

    const instructions = [];

    try {

        new Function(
            "instructions",
            code
        )(instructions);

    } catch (error) {

        console.error("Blockly Generator Error:", error);

    }

    return instructions;

}

// [
//   {
//     type: "ted",
//     colour: "red",
//     size: "extra_large",
//     weight: "bold"
//   },
//   {
//     type: "x",
//     colour: "red",
//     size: "large",
//     weight: "normal"
//   },
//   {
//     type: "iitgn",
//     colour: "white",
//     size: "medium",
//     weight: "normal"
//   }
// ]