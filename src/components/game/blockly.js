import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

/*
|--------------------------------------------------------------------------
| Add Text Block
|--------------------------------------------------------------------------
*/
Blockly.Blocks["ted_text"] = {
  init: function () {

    this.appendDummyInput()
      .appendField("🟥 TED");

    this.appendDummyInput()
      .appendField("Colour")
      .appendField(
        new Blockly.FieldDropdown([
          ["Red", "red"],
          ["White", "white"],
          ["Black", "black"],
          ["Gray", "gray"]
        ]),
        "COLOUR"
      );

    this.appendDummyInput()
      .appendField("Font Size")
      .appendField(
        new Blockly.FieldDropdown([
          ["Small", "small"],
          ["Medium", "medium"],
          ["Large", "large"],
          ["Extra Large", "extra_large"]
        ]),
        "SIZE"
      );

    this.appendDummyInput()
      .appendField("Font Weight")
      .appendField(
        new Blockly.FieldDropdown([
          ["Normal", "normal"],
          ["Bold", "bold"]
        ]),
        "WEIGHT"
      );

    this.setPreviousStatement(true);
    this.setNextStatement(true);

    this.setColour("#E10600");

    this.setTooltip("Configure the TED text.");
  }
};

Blockly.Blocks["ted_x"] = {
  init: function () {

    this.appendDummyInput()
      .appendField("❌ x");

    this.appendDummyInput()
      .appendField("Colour")
      .appendField(
        new Blockly.FieldDropdown([
          ["Red", "red"],
          ["White", "white"],
          ["Black", "black"],
          ["Gray", "gray"]
        ]),
        "COLOUR"
      );

    this.appendDummyInput()
      .appendField("Font Size")
      .appendField(
        new Blockly.FieldDropdown([
          ["Small", "small"],
          ["Medium", "medium"],
          ["Large", "large"],
          ["Extra Large", "extra_large"]
        ]),
        "SIZE"
      );

    this.appendDummyInput()
      .appendField("Font Weight")
      .appendField(
        new Blockly.FieldDropdown([
          ["Normal", "normal"],
          ["Bold", "bold"]
        ]),
        "WEIGHT"
      );

    this.setPreviousStatement(true);
    this.setNextStatement(true);

    this.setColour("#d32f2f");

    this.setTooltip("Configure the x.");
  }
};

Blockly.Blocks["iitgn_text"] = {
  init: function () {

    this.appendDummyInput()
      .appendField("⚪ IIT Gandhinagar");

    this.appendDummyInput()
      .appendField("Colour")
      .appendField(
        new Blockly.FieldDropdown([
          ["White", "white"],
          ["Red", "red"],
          ["Black", "black"],
          ["Gray", "gray"]
        ]),
        "COLOUR"
      );

    this.appendDummyInput()
      .appendField("Font Size")
      .appendField(
        new Blockly.FieldDropdown([
          ["Small", "small"],
          ["Medium", "medium"],
          ["Large", "large"]
        ]),
        "SIZE"
      );

    this.appendDummyInput()
      .appendField("Font Weight")
      .appendField(
        new Blockly.FieldDropdown([
          ["Normal", "normal"],
          ["Bold", "bold"]
        ]),
        "WEIGHT"
      );

    this.setPreviousStatement(true);
    this.setNextStatement(true);

    this.setColour("#616161");

    this.setTooltip("Configure the subtitle.");
  }
};

export const toolbox = {
  kind: "flyoutToolbox",
  contents: [
    {
      kind: "block",
      type: "ted_text"
    },
    {
      kind: "block",
      type: "ted_x"
    },
    {
      kind: "block",
      type: "iitgn_text"
    }
  ]
};