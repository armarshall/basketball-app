import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { TeamCreationForm } from "./TeamCreationForm";

import { test, expect } from "@jest/globals";

test("", () => {
  const myComponent = render(<TeamCreationForm />);
  expect(myComponent).toMatchSnapshot();
});
