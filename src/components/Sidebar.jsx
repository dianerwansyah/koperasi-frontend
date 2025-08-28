import React from "react";
import { Link } from "react-router-dom";
import { menus } from "../config/menuConfig";
import { useSelector } from "react-redux";
import DynamicHeroIcon from "./DynamicHeroIcon";

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "guest";

  const filteredMenus = menus.filter((menu) => menu.roles.includes(role));

  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 shadow">
      <nav>
        <ul>
          {filteredMenus.map(({ id, title, path, icon }) => (
            <li key={id} className="mb-2">
              <Link
                to={path === "" ? "/" : `/${path}`}
                className="flex items-center gap-2 p-2 rounded text-gray-700 hover:bg-indigo-200"
              >
                <DynamicHeroIcon name={icon} className="w-5 h-5" />
                <span>{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
