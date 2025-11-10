import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { StatsUpdater } from "./StatsEditor";

import { test, expect } from "@jest/globals";

test("", () => {
  const myComponent = render(
    <StatsUpdater player_id="" is_teen={false} game_id="0" />,
  );
  expect(myComponent).toMatchSnapshot();
});
