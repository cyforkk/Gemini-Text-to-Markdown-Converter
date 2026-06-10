const { convertMarkdown } = require("../converter.js");

const cases = [
  {
    name: "moves Gemini language label onto fence",
    input: "Bash\n\n```\necho ok\n```\n",
    expected: "```Bash\necho ok\n```\n",
  },
  {
    name: "removes one extra leading blank line inside converted fence",
    input: "Bash\n\n```\n\necho ok\n```\n",
    expected: "```Bash\necho ok\n```\n",
  },
  {
    name: "removes multiple leading blank lines inside converted fence",
    input: "Bash\n\n```\n\n\n echo ok\n```\n",
    expected: "```Bash\n echo ok\n```\n",
  },
  {
    name: "removes one extra trailing blank line inside converted fence",
    input: "Bash\n\n```\necho ok\n\n```\n",
    expected: "```Bash\necho ok\n```\n",
  },
  {
    name: "removes multiple trailing blank lines inside converted fence",
    input: "Bash\n\n```\necho ok\n\n  \n```\n",
    expected: "```Bash\necho ok\n```\n",
  },
  {
    name: "removes trailing blank lines inside already-tagged fence",
    input: "```bash\ncurl -o my_script.sh https://example.com/install.sh\n\n```\n",
    expected: "```bash\ncurl -o my_script.sh https://example.com/install.sh\n```\n",
  },
  {
    name: "keeps already-correct fenced code unchanged",
    input: "```Python\nprint(1)\n```\n",
    expected: "```Python\nprint(1)\n```\n",
  },
  {
    name: "does not convert Gemini-looking text inside an existing code block",
    input: "````markdown\nBash\n\n```\nno change inside\n```\n````\n",
    expected: "````markdown\nBash\n\n```\nno change inside\n```\n````\n",
  },
];

for (const testCase of cases) {
  const actual = convertMarkdown(testCase.input);
  if (actual !== testCase.expected) {
    console.error(`Failed: ${testCase.name}`);
    console.error(JSON.stringify({ actual, expected: testCase.expected }, null, 2));
    process.exit(1);
  }
}

console.log(`Passed ${cases.length} converter.js test(s).`);
