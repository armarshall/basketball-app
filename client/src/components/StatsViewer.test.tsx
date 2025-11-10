import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import { test, expect } from "@jest/globals";
import { StatsViewer } from "./StatsViewer";

test("", () => {
  const myComponent = render(<StatsViewer is_teen={false} player_id="" />);
  expect(myComponent).toMatchSnapshot();
});
