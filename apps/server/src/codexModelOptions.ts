import type { ModelSelection, ServerProviderModel } from "@t3tools/contracts";
import {
  codexModelFamily,
  getModelSelectionBooleanOptionValue,
  getModelSelectionStringOptionValue,
} from "@t3tools/shared/model";

export const CYBER_ACCESS_PROGRAM_OPTION_ID = "cyberAccessProgram" as const;

const CODEX_CYBER_ACCESS_PROGRAMS = ["standard", "daybreakBlue", "daybreakRed"] as const;

export type CodexCyberAccessProgram = (typeof CODEX_CYBER_ACCESS_PROGRAMS)[number];

function isCodexCyberAccessProgram(value: unknown): value is CodexCyberAccessProgram {
  return (
    typeof value === "string" &&
    (CODEX_CYBER_ACCESS_PROGRAMS as ReadonlyArray<string>).includes(value)
  );
}

export function getCodexServiceTierOptionValue(
  modelSelection: ModelSelection | null | undefined,
): string | undefined {
  return (
    getModelSelectionStringOptionValue(modelSelection, "serviceTier") ??
    (getModelSelectionBooleanOptionValue(modelSelection, "fastMode") === true ? "fast" : undefined)
  );
}

function getCodexCyberAccessProgramOptionValue(
  modelSelection: ModelSelection | null | undefined,
): string | undefined {
  return getModelSelectionStringOptionValue(modelSelection, CYBER_ACCESS_PROGRAM_OPTION_ID);
}

export function codexModelCyberAccessPrograms(
  models: ReadonlyArray<ServerProviderModel> | undefined,
  modelSlug: string,
): ReadonlyArray<CodexCyberAccessProgram> | undefined {
  if (!models || models.length === 0) {
    return undefined;
  }
  const normalizedFamily = codexModelFamily(modelSlug);
  const matched =
    models.find((model) => model.slug === modelSlug) ??
    models.find((model) => !model.isCustom && codexModelFamily(model.slug) === normalizedFamily);
  if (!matched) {
    return undefined;
  }
  const descriptor = matched.capabilities?.optionDescriptors?.find(
    (entry) => entry.id === CYBER_ACCESS_PROGRAM_OPTION_ID && entry.type === "select",
  );
  if (!descriptor || descriptor.type !== "select") {
    return [];
  }
  return descriptor.options
    .map((option) => option.id)
    .filter((id): id is CodexCyberAccessProgram => isCodexCyberAccessProgram(id));
}

export function resolveCodexCyberAccessProgram(
  modelSelection: ModelSelection | null | undefined,
  availableCyberAccessPrograms?: ReadonlyArray<CodexCyberAccessProgram> | null | undefined,
): CodexCyberAccessProgram | undefined {
  const rawSelected = getCodexCyberAccessProgramOptionValue(modelSelection);
  const selected = isCodexCyberAccessProgram(rawSelected) ? rawSelected : undefined;

  if (availableCyberAccessPrograms === undefined || availableCyberAccessPrograms === null) {
    return selected;
  }
  if (availableCyberAccessPrograms.length === 0) {
    return undefined;
  }
  if (selected !== undefined && availableCyberAccessPrograms.includes(selected)) {
    return selected;
  }
  if (rawSelected !== undefined) {
    if (selected === "standard") {
      return undefined;
    }
    return availableCyberAccessPrograms.includes("standard") ? "standard" : undefined;
  }
  if (availableCyberAccessPrograms.includes("standard")) {
    return "standard";
  }
  return availableCyberAccessPrograms[0];
}
