import { Provider as ReduxProvider } from "react-redux";
import store from "../../../store/index";

export default function Provider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
