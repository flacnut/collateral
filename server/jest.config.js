module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/client/", "/node_modules/"],
  testMatch: ["<rootDir>/src/**/__test__/**/*.ts"],
};
