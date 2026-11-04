export const GenderEnum = {
  None: 0,
  Female: 1,
  Male: 2,
  NonBinary: 3,
  SelfDescribed: 4,
  PreferNotToAnswer: 5,
};

export const MaritalStatusEnum = {
  Single: 0,
  Married: 1,
  Divorced: 2,
  Widow: 3,
  Widower: 4,
  Complicated: 5,
};

export const GenderOptions = [
  { value: GenderEnum.Female, label: "Female" },
  { value: GenderEnum.Male, label: "Male" },
  { value: GenderEnum.NonBinary, label: "Non-Binary" },
  { value: GenderEnum.SelfDescribed, label: "Self-Described" },
  { value: GenderEnum.PreferNotToAnswer, label: "Prefer Not to Answer" },
];

export const MaritalStatusOptions = [
  { value: MaritalStatusEnum.Single, label: "Single" },
  { value: MaritalStatusEnum.Married, label: "Married" },
  { value: MaritalStatusEnum.Divorced, label: "Divorced" },
  { value: MaritalStatusEnum.Widow, label: "Widow" },
  { value: MaritalStatusEnum.Widower, label: "Widower" },
  { value: MaritalStatusEnum.Complicated, label: "Complicated" },
];
