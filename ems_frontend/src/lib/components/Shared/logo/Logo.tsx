import type { FC } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import type { IState } from "../../../../store/reducers";

const Logo: FC = () => {
  const customizer = useSelector((state: IState) => state.customizer);

  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse && !customizer.isSidebarHover ? "40px" : "180px",
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled to="/">
        {customizer.activeMode === "dark" ? (
          <img
            src="/images/logos/light-logo.svg"
            alt="logo"
            height={customizer.TopbarHeight}
            width={174}
            style={{ display: "block" }}
          />
        ) : (
          <img
            src={"/images/logos/dark-logo.svg"}
            alt="logo"
            height={customizer.TopbarHeight}
            width={174}
            style={{ display: "block" }}
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled to="/">
      {customizer.activeMode === "dark" ? (
        <img
          src="/images/logos/dark-rtl-logo.svg"
          alt="logo"
          height={customizer.TopbarHeight}
          width={174}
          style={{ display: "block" }}
        />
      ) : (
        <img
          src="/images/logos/light-logo-rtl.svg"
          alt="logo"
          height={customizer.TopbarHeight}
          width={174}
          style={{ display: "block" }}
        />
      )}
    </LinkStyled>
  );
};

export default Logo;
