"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionModule,
  type Permissions,
} from "@/data/permissions";

interface PermissionMatrixProps {
  value: Permissions;
  onChange: (value: Permissions) => void;
  disabled?: boolean;
}

const ALL_ACTIONS = PERMISSION_ACTIONS.map((a) => a.key) as PermissionAction[];

// Module × action checkboxes, with "Full access" per module and "Select all".
export default function PermissionMatrix({
  value,
  onChange,
  disabled,
}: PermissionMatrixProps) {
  const has = (m: PermissionModule, a: PermissionAction) =>
    Boolean(value[m]?.includes(a));
  const full = (m: PermissionModule) => ALL_ACTIONS.every((a) => has(m, a));
  const allFull = PERMISSION_MODULES.every((m) => full(m.key));

  const setModule = (m: PermissionModule, actions: PermissionAction[]) => {
    const next = { ...value };
    if (actions.length) next[m] = actions;
    else delete next[m];
    onChange(next);
  };

  const toggle = (m: PermissionModule, a: PermissionAction, on: boolean) => {
    let actions = new Set(value[m] || []);
    if (on) {
      actions.add(a);
      if (a !== "view") actions.add("view"); // add/edit/delete need to see the list
    } else {
      actions.delete(a);
      if (a === "view") actions = new Set(); // no view = no access
    }
    setModule(
      m,
      ALL_ACTIONS.filter((x) => actions.has(x)),
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-120 text-sm">
        <thead className="bg-gray-50 dark:bg-white/3">
          <tr>
            <th className="px-4 py-2.5 text-start font-medium text-gray-600 dark:text-gray-400">
              Module
            </th>
            <th className="px-3 py-2.5 text-center font-medium text-gray-600 dark:text-gray-400">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={allFull}
                  disabled={disabled}
                  onCheckedChange={(on) =>
                    onChange(
                      on
                        ? Object.fromEntries(
                            PERMISSION_MODULES.map((m) => [
                              m.key,
                              [...ALL_ACTIONS],
                            ]),
                          )
                        : {},
                    )
                  }
                  aria-label="Full access to everything"
                />
                Full access
              </label>
            </th>
            {PERMISSION_ACTIONS.map((a) => (
              <th
                key={a.key}
                className="px-3 py-2.5 text-center font-medium text-gray-600 dark:text-gray-400"
              >
                {a.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {PERMISSION_MODULES.map((m) => (
            <tr key={m.key} className="hover:bg-gray-50 dark:hover:bg-white/3">
              <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-white/90">
                {m.label}
              </td>
              <td className="px-3 py-2.5 text-center">
                <Checkbox
                  className="mx-auto"
                  checked={full(m.key)}
                  disabled={disabled}
                  onCheckedChange={(on) =>
                    setModule(m.key, on ? [...ALL_ACTIONS] : [])
                  }
                  aria-label={`Full access to ${m.label}`}
                />
              </td>
              {PERMISSION_ACTIONS.map((a) => (
                <td key={a.key} className="px-3 py-2.5 text-center">
                  <Checkbox
                    className="mx-auto"
                    checked={has(m.key, a.key)}
                    disabled={disabled}
                    onCheckedChange={(on) => toggle(m.key, a.key, Boolean(on))}
                    aria-label={`${a.label} ${m.label}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
