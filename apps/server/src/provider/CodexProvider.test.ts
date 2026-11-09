import { assert, it } from "@effect/vitest";

import { codexModelCyberAccessPrograms } from "../codexModelOptions.ts";
import { applyPreferredCodexDefaultModel, mapCodexModelCapabilities } from "./CodexProvider.ts";

it("maps current Codex model capability fields", () => {
  const capabilities = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    defaultReasoningEffort: "super-high",
    description: "Test model",
    displayName: "GPT Test",
    hidden: false,
    id: "gpt-test",
    isDefault: true,
    model: "gpt-test",
    defaultServiceTier: "flex",
    serviceTiers: [
      {
        id: "priority",
        name: "Fast",
        description: "Lower latency responses.",
      },
      {
        id: "flex",
        name: "Flex",
        description: "Lower-cost asynchronous routing.",
      },
    ],
    supportedReasoningEfforts: [
      {
        description: "Maximum reasoning",
        reasoningEffort: "super-high",
      },
    ],
  });

  assert.deepStrictEqual(capabilities.optionDescriptors, [
    {
      id: "reasoningEffort",
      label: "Reasoning",
      type: "select",
      options: [{ id: "super-high", label: "super-high", isDefault: true }],
      currentValue: "super-high",
    },
    {
      id: "serviceTier",
      label: "Service Tier",
      type: "select",
      options: [
        { id: "default", label: "Standard" },
        {
          id: "priority",
          label: "Fast",
          description: "Lower latency responses.",
        },
        {
          id: "flex",
          label: "Flex",
          description: "Lower-cost asynchronous routing.",
          isDefault: true,
        },
      ],
      currentValue: "flex",
    },
  ]);
});

it("uses standard routing when the catalog has no default service tier", () => {
  const capabilities = mapCodexModelCapabilities({
    additionalSpeedTiers: ["fast"],
    defaultReasoningEffort: "medium",
    defaultServiceTier: null,
    description: "Test model",
    displayName: "GPT Test",
    hidden: false,
    id: "gpt-test",
    isDefault: true,
    model: "gpt-test",
    serviceTiers: [
      {
        id: "priority",
        name: "Fast",
        description: "1.5x speed, increased usage",
      },
      {
        id: "ultrafast",
        name: "Ultrafast",
        description: "The fastest available responses for latency-sensitive work.",
      },
    ],
    supportedReasoningEfforts: [],
  });

  assert.deepStrictEqual(capabilities.optionDescriptors, [
    {
      id: "serviceTier",
      label: "Service Tier",
      type: "select",
      options: [
        { id: "default", label: "Standard", isDefault: true },
        {
          id: "priority",
          label: "Fast",
          description: "1.5x speed, increased usage",
        },
        {
          id: "ultrafast",
          label: "Ultrafast",
          description: "Even faster, more expensive",
        },
      ],
      currentValue: "default",
    },
  ]);
});

it("omits Cyber Access selector for Standard-only models and older Codex versions", () => {
  const standardOnly = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    availableAccessPrograms: { cyber: ["standard"] },
    defaultReasoningEffort: "medium",
    description: "GPT-6.1 Sol",
    displayName: "GPT-6.1-Sol",
    hidden: false,
    id: "gpt-6.1-sol",
    isDefault: false,
    model: "gpt-6.1-sol",
    supportedReasoningEfforts: [{ description: "Medium", reasoningEffort: "medium" }],
  });
  assert.isUndefined(
    standardOnly.optionDescriptors?.find((descriptor) => descriptor.id === "cyberAccessProgram"),
  );

  const legacyNull = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    availableAccessPrograms: null,
    defaultReasoningEffort: "medium",
    description: "Legacy model",
    displayName: "GPT-5.4",
    hidden: false,
    id: "gpt-5.4",
    isDefault: true,
    model: "gpt-5.4",
    supportedReasoningEfforts: [{ description: "Medium", reasoningEffort: "medium" }],
  });
  assert.isUndefined(
    legacyNull.optionDescriptors?.find((descriptor) => descriptor.id === "cyberAccessProgram"),
  );
});

it("maps Cyber Access programs for Standard + Daybreak Blue, Daybreak Blue-only, and Daybreak Red models", () => {
  const solCapabilities = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    availableAccessPrograms: { cyber: ["standard", "daybreakBlue"] },
    defaultReasoningEffort: "medium",
    description: "GPT-6 Sol",
    displayName: "GPT-6-Sol",
    hidden: false,
    id: "gpt-6-sol",
    isDefault: false,
    model: "gpt-6-sol",
    supportedReasoningEfforts: [{ description: "Medium", reasoningEffort: "medium" }],
  });
  assert.deepStrictEqual(
    solCapabilities.optionDescriptors?.find((descriptor) => descriptor.id === "cyberAccessProgram"),
    {
      id: "cyberAccessProgram",
      label: "Cyber Access",
      type: "select",
      options: [
        { id: "standard", label: "Standard", isDefault: true },
        { id: "daybreakBlue", label: "Daybreak Blue" },
      ],
      currentValue: "standard",
    },
  );

  const daybreakOnlyCapabilities = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    availableAccessPrograms: { cyber: ["daybreakBlue"] },
    defaultReasoningEffort: "medium",
    description: "Dedicated Daybreak Blue model",
    displayName: "gpt-daybreak-blue-latest",
    hidden: true,
    id: "gpt-daybreak-blue-latest",
    isDefault: false,
    model: "gpt-daybreak-blue-latest",
    supportedReasoningEfforts: [{ description: "Medium", reasoningEffort: "medium" }],
  });
  assert.deepStrictEqual(
    daybreakOnlyCapabilities.optionDescriptors?.find(
      (descriptor) => descriptor.id === "cyberAccessProgram",
    ),
    {
      id: "cyberAccessProgram",
      label: "Cyber Access",
      type: "select",
      options: [{ id: "daybreakBlue", label: "Daybreak Blue", isDefault: true }],
      currentValue: "daybreakBlue",
    },
  );

  const redCapabilities = mapCodexModelCapabilities({
    additionalSpeedTiers: [],
    availableAccessPrograms: { cyber: ["standard", "daybreakBlue", "daybreakRed"] },
    defaultReasoningEffort: "high",
    description: "Red authorized model",
    displayName: "GPT-6-Sol",
    hidden: false,
    id: "gpt-6-sol",
    isDefault: false,
    model: "gpt-6-sol",
    supportedReasoningEfforts: [{ description: "High", reasoningEffort: "high" }],
  });
  assert.deepStrictEqual(
    redCapabilities.optionDescriptors?.find((descriptor) => descriptor.id === "cyberAccessProgram"),
    {
      id: "cyberAccessProgram",
      label: "Cyber Access",
      type: "select",
      options: [
        { id: "standard", label: "Standard", isDefault: true },
        { id: "daybreakBlue", label: "Daybreak Blue" },
        { id: "daybreakRed", label: "Daybreak Red" },
      ],
      currentValue: "standard",
    },
  );

  const models = [
    { slug: "gpt-6-sol", name: "GPT-6 Sol", isCustom: false, capabilities: solCapabilities },
    {
      slug: "gpt-daybreak-blue-latest",
      name: "GPT Daybreak Blue Latest",
      isCustom: false,
      capabilities: daybreakOnlyCapabilities,
    },
    { slug: "gpt-6.1-sol", name: "GPT-6.1 Sol", isCustom: false, capabilities: null },
  ];
  assert.deepStrictEqual(codexModelCyberAccessPrograms(models, "gpt-6-sol"), [
    "standard",
    "daybreakBlue",
  ]);
  assert.deepStrictEqual(codexModelCyberAccessPrograms(models, "openai.gpt-6-sol"), [
    "standard",
    "daybreakBlue",
  ]);
  assert.deepStrictEqual(codexModelCyberAccessPrograms(models, "gpt-daybreak-blue-latest"), [
    "daybreakBlue",
  ]);
  assert.deepStrictEqual(codexModelCyberAccessPrograms(models, "gpt-6.1-sol"), []);
  assert.isUndefined(codexModelCyberAccessPrograms(models, "unknown-model"));
});

it("marks the most preferred available model as default", () => {
  const models = applyPreferredCodexDefaultModel([
    { slug: "gpt-5.6-terra", name: "GPT-5.6-Terra", isCustom: false, capabilities: null },
    { slug: "gpt-5.4", name: "GPT-5.4", isCustom: false, isDefault: true, capabilities: null },
  ]);

  assert.deepStrictEqual(
    models.map((model) => ({ slug: model.slug, isDefault: model.isDefault })),
    [
      { slug: "gpt-5.6-terra", isDefault: true },
      { slug: "gpt-5.4", isDefault: undefined },
    ],
  );
});

it("ranks qualified Codex models while preserving their wire ids", () => {
  const models = applyPreferredCodexDefaultModel([
    {
      slug: "openai.gpt-5.6-luna",
      name: "Luna",
      isCustom: false,
      isDefault: true,
      capabilities: null,
    },
    { slug: "openai.gpt-5.6-sol", name: "Sol", isCustom: false, capabilities: null },
  ]);
  assert.deepStrictEqual(
    models.filter((model) => model.isDefault).map((model) => model.slug),
    ["openai.gpt-5.6-sol"],
  );
});

it("ignores custom models that shadow a preferred slug", () => {
  const models = applyPreferredCodexDefaultModel([
    { slug: "gpt-5.6-sol", name: "gpt-5.6-sol", isCustom: true, capabilities: null },
    { slug: "gpt-5.4", name: "GPT-5.4", isCustom: false, isDefault: true, capabilities: null },
  ]);

  assert.deepStrictEqual(models.find((model) => model.isDefault)?.slug, "gpt-5.4");
});
