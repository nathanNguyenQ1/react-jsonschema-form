import React from "react";
import { expect } from "chai";
import { Simulate } from "react-dom/test-utils";
import sinon from "sinon";

import { createFormComponent, createSandbox, setProps } from "./test_utils";
import SchemaField from "../src/components/fields/SchemaField";

describe("oneOf", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should not render a select element if the oneOf keyword is not present", () => {
    const schema = {
      type: "object",
      properties: {
        foo: { type: "string" },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("select")).to.have.length.of(0);
  });

  it("should render a select element if the oneOf keyword is present", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("select")).to.have.length.of(1);
    expect(node.querySelector("select").id).eql("root__oneof_select");
  });

  it("should assign a default value and set defaults on option change", () => {
    const { node, onChange } = createFormComponent({
      schema: {
        oneOf: [
          {
            type: "object",
            properties: {
              foo: { type: "string", default: "defaultfoo" },
            },
          },
          {
            type: "object",
            properties: {
              foo: { type: "string", default: "defaultbar" },
            },
          },
        ],
      },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultfoo" },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultbar" },
    });
  });

  it("should assign a default value and set defaults on option change when using refs", () => {
    const { node, onChange } = createFormComponent({
      schema: {
        oneOf: [
          {
            type: "object",
            properties: {
              foo: { type: "string", default: "defaultfoo" },
            },
          },
          { $ref: "#/definitions/bar" },
        ],
        definitions: {
          bar: {
            type: "object",
            properties: {
              foo: { type: "string", default: "defaultbar" },
            },
          },
        },
      },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultfoo" },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultbar" },
    });
  });

  it("should assign a default value and set defaults on option change with 'type': 'object' missing", () => {
    const { node, onChange } = createFormComponent({
      schema: {
        type: "object",
        oneOf: [
          {
            properties: {
              foo: { type: "string", default: "defaultfoo" },
            },
          },
          {
            properties: {
              foo: { type: "string", default: "defaultbar" },
            },
          },
        ],
      },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultfoo" },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "defaultbar" },
    });
  });

  it("should render a custom widget", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };
    const widgets = {
      SelectWidget: () => {
        return <section id="CustomSelect">Custom Widget</section>;
      },
    };

    const { node } = createFormComponent({
      schema,
      widgets,
    });

    expect(node.querySelector("#CustomSelect")).to.exist;
  });

  it("should change the rendered form when the select value is changed", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll("#root_foo")).to.have.length.of(1);
    expect(node.querySelectorAll("#root_bar")).to.have.length.of(0);

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(node.querySelectorAll("#root_foo")).to.have.length.of(0);
    expect(node.querySelectorAll("#root_bar")).to.have.length.of(1);
  });

  it("should handle change events", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_foo"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { foo: "Lorem ipsum dolor sit amet" },
    });
  });

  it("should clear previous data when changing options", () => {
    const schema = {
      type: "object",
      properties: {
        buzz: { type: "string" },
      },
      oneOf: [
        {
          properties: {
            foo: { type: "string" },
          },
        },
        {
          properties: {
            bar: { type: "string" },
          },
        },
      ],
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_buzz"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    Simulate.change(node.querySelector("input#root_foo"), {
      target: { value: "Consectetur adipiscing elit" },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: {
        buzz: "Lorem ipsum dolor sit amet",
        foo: "Consectetur adipiscing elit",
      },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: {
        buzz: "Lorem ipsum dolor sit amet",
        foo: undefined,
      },
    });
  });

  it("should support options with different types", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector("input#root_userId"), {
      target: { value: 12345 },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: {
        userId: 12345,
      },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: {
        userId: undefined,
      },
    });

    Simulate.change(node.querySelector("input#root_userId"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });
    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: {
        userId: "Lorem ipsum dolor sit amet",
      },
    });
  });

  it("should support custom fields", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const CustomField = () => {
      return <div id="custom-oneof-field" />;
    };

    const { node } = createFormComponent({
      schema,
      fields: {
        OneOfField: CustomField,
      },
    });

    expect(node.querySelectorAll("#custom-oneof-field")).to.have.length(1);
  });

  it("should pass form context to schema field", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };
    const formContext = { root: "root-id", root_userId: "userId-id" };
    function CustomSchemaField(props) {
      const { formContext, idSchema } = props;
      return (
        <>
          <code id={formContext[idSchema.$id]}>Ha</code>
          <SchemaField {...props} />
        </>
      );
    }
    const { node } = createFormComponent({
      schema,
      formData: { userId: "foobarbaz" },
      formContext,
      fields: { SchemaField: CustomSchemaField },
    });

    const codeBlocks = node.querySelectorAll("code");
    expect(codeBlocks).to.have.length(3);
    Object.keys(formContext).forEach((key) => {
      expect(node.querySelector(`code#${formContext[key]}`)).to.exist;
    });
  });

  it("should select the correct field when the form is rendered from existing data", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
      formData: {
        userId: "foobarbaz",
      },
    });

    expect(node.querySelector("select").value).eql("1");
  });

  it("should select the correct field when the formData property is updated", () => {
    const schema = {
      type: "object",
      properties: {
        userId: {
          oneOf: [
            {
              type: "number",
            },
            {
              type: "string",
            },
          ],
        },
      },
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    expect(node.querySelector("select").value).eql("0");

    setProps(comp, {
      schema,
      formData: {
        userId: "foobarbaz",
      },
    });

    expect(node.querySelector("select").value).eql("1");
  });

  it("should not change the selected option when entering values on a subschema with multiple required options", () => {
    const schema = {
      type: "object",
      properties: {
        items: {
          oneOf: [
            {
              type: "string",
            },
            {
              type: "object",
              properties: {
                foo: {
                  type: "integer",
                },
                bar: {
                  type: "string",
                },
              },
              required: ["foo", "bar"],
            },
          ],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    const $select = node.querySelector("select");

    expect($select.value).eql("0");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).eql("1");

    Simulate.change(node.querySelector("input#root_items_bar"), {
      target: { value: "Lorem ipsum dolor sit amet" },
    });

    expect($select.value).eql("1");
  });

  it("should empty the form data when switching from an option of type 'object'", () => {
    const schema = {
      oneOf: [
        {
          type: "object",
          properties: {
            foo: {
              type: "integer",
            },
            bar: {
              type: "string",
            },
          },
          required: ["foo", "bar"],
        },
        {
          type: "string",
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
      formData: {
        foo: 1,
        bar: "abc",
      },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).eql("1");

    expect(node.querySelector("input#root").value).eql("");
  });

  it("should use only the selected option when generating default values", () => {
    const schema = {
      type: "object",
      oneOf: [
        {
          additionalProperties: false,
          properties: { lorem: { type: "object" } },
        },
        {
          additionalProperties: false,
          properties: { ipsum: { type: "object" } },
        },
        {
          additionalProperties: false,
          properties: { pyot: { type: "object" } },
        },
      ],
    };

    const { node, onChange } = createFormComponent({
      schema,
      formData: { lorem: {} },
    });

    const $select = node.querySelector("select");

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).eql("1");

    sinon.assert.calledWithMatch(onChange.lastCall, {
      formData: { lorem: undefined, ipsum: {} },
    });
  });

  describe("Arrays", () => {
    it("should correctly render mixed types for oneOf inside array items", () => {
      const schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    foo: {
                      type: "integer",
                    },
                    bar: {
                      type: "string",
                    },
                  },
                },
              ],
            },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      expect(node.querySelector(".array-item-add button")).not.eql(null);

      Simulate.click(node.querySelector(".array-item-add button"));

      const $select = node.querySelector("select");
      expect($select).not.eql(null);
      Simulate.change($select, {
        target: { value: $select.options[1].value },
      });

      expect(node.querySelectorAll("input#root_items_0_foo")).to.have.length.of(
        1
      );
      expect(node.querySelectorAll("input#root_items_0_bar")).to.have.length.of(
        1
      );
    });
  });

  describe("definitions", () => {
    it("should handle the $ref keyword correctly", () => {
      const schema = {
        definitions: {
          fieldEither: {
            type: "object",
            oneOf: [
              {
                type: "object",
                properties: {
                  value: {
                    type: "string",
                  },
                },
              },
              {
                type: "object",
                properties: {
                  value: {
                    type: "array",
                    items: {
                      $ref: "#/definitions/fieldEither",
                    },
                  },
                },
              },
            ],
          },
        },
        type: "object",
        properties: {
          value: {
            type: "array",
            items: {
              $ref: "#/definitions/fieldEither",
            },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      expect(node.querySelector(".array-item-add button")).not.eql(null);

      Simulate.click(node.querySelector(".array-item-add button"));

      const $select = node.querySelector("select");
      expect($select).not.eql(null);
      Simulate.change($select, {
        target: { value: $select.options[1].value },
      });

      // This works because the nested "add" button will now be the first to
      // appear in the dom
      Simulate.click(node.querySelector(".array-item-add button"));

      expect($select.value).to.eql($select.options[1].value);
    });

    it("should correctly set the label of the options", () => {
      const schema = {
        type: "object",
        oneOf: [
          {
            title: "Foo",
            properties: {
              foo: { type: "string" },
            },
          },
          {
            properties: {
              bar: { type: "string" },
            },
          },
          {
            $ref: "#/definitions/baz",
          },
        ],
        definitions: {
          baz: {
            title: "Baz",
            properties: {
              baz: { type: "string" },
            },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      const $select = node.querySelector("select");

      expect($select.options[0].text).eql("Foo");
      expect($select.options[1].text).eql("Option 2");
      expect($select.options[2].text).eql("Baz");
    });
  });

  it("should correctly infer the selected option based on value", () => {
    const schema = {
      $ref: "#/defs/any",
      defs: {
        chain: {
          type: "object",
          title: "Chain",
          properties: {
            id: {
              enum: ["chain"],
            },
            components: {
              type: "array",
              items: { $ref: "#/defs/any" },
            },
          },
        },

        map: {
          type: "object",
          title: "Map",
          properties: {
            id: { enum: ["map"] },
            fn: { $ref: "#/defs/any" },
          },
        },

        to_absolute: {
          type: "object",
          title: "To Absolute",
          properties: {
            id: { enum: ["to_absolute"] },
            base_url: { type: "string" },
          },
        },

        transform: {
          type: "object",
          title: "Transform",
          properties: {
            id: { enum: ["transform"] },
            property_key: { type: "string" },
            transformer: { $ref: "#/defs/any" },
          },
        },
        any: {
          oneOf: [
            { $ref: "#/defs/chain" },
            { $ref: "#/defs/map" },
            { $ref: "#/defs/to_absolute" },
            { $ref: "#/defs/transform" },
          ],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
      formData: {
        id: "chain",
        components: [
          {
            id: "map",
            fn: {
              id: "transform",
              property_key: "uri",
              transformer: {
                id: "to_absolute",
                base_url: "http://localhost",
              },
            },
          },
        ],
      },
    });

    const rootId = node.querySelector("select#root_id");
    expect(rootId.value).eql("chain");
    const componentId = node.querySelector("select#root_components_0_id");
    expect(componentId.value).eql("map");

    const fnId = node.querySelector("select#root_components_0_fn_id");
    expect(fnId.value).eql("transform");

    const transformerId = node.querySelector(
      "select#root_components_0_fn_transformer_id"
    );
    expect(transformerId.value).eql("to_absolute");
  });

  describe("Custom Field", function () {
    const schema = {
      anyOf: [
        {
          type: "number",
        },
        {
          type: "string",
        },
      ],
    };
    const uiSchema = {
      "ui:field": () => <div className="custom-field">Custom field</div>,
    };
    it("should be rendered once", function () {
      const { node } = createFormComponent({ schema, uiSchema });
      const fields = node.querySelectorAll(".custom-field");
      expect(fields).to.have.length.of(1);
    });
    it("should not render <select>", function () {
      const { node } = createFormComponent({ schema, uiSchema });
      const selects = node.querySelectorAll("select");
      expect(selects).to.have.length.of(0);
    });
  });
});
