"use client";
import { useState } from "react";
import { RepeatableBlock, CustomFieldsBlock } from "./ui";

// Generic category-based form: each category has a toggle + collapsible RepeatableBlock
// data = { [catId]: { enabled, [itemsKey]: [] } }  (does NOT include customFields)
export function CategoryListForm({ categories, data = {}, onChange, customFields = [], onCustomFieldsChange, itemsKey, itemFields, itemAddLabel, categoryIcons = {} }) {
  const [openCats, setOpenCats] = useState({});

  const toggleCat = (catId) => {
    setOpenCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getCatData = (catId) => data[catId] || { enabled: false, [itemsKey]: [] };
  const setCatData = (catId, val) => onChange({ ...data, [catId]: val });
  const toggleCatEnabled = (catId) => {
    const d = getCatData(catId);
    const newEnabled = !d.enabled;
    setCatData(catId, { ...d, enabled: newEnabled });
    if (newEnabled) setOpenCats(prev => ({ ...prev, [catId]: true }));
  };
  const setCatItems = (catId, items) => {
    setCatData(catId, { ...getCatData(catId), [itemsKey]: items });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {categories.map(cat => {
        const catData = getCatData(cat.id);
        const isOpen = openCats[cat.id];

        return (
          <div
            key={cat.id}
            style={{
              borderRadius: 12, border: `1px solid ${catData.enabled ? "rgba(42,107,90,0.2)" : "rgba(0,0,0,0.08)"}`,
              overflow: "hidden", transition: "border .2s",
            }}
          >
            {/* Category header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 16px",
              background: catData.enabled ? "rgba(42,107,90,0.04)" : "#fff",
              transition: "background .2s",
            }}>
              {/* Toggle enabled */}
              <button
                type="button"
                onClick={() => toggleCatEnabled(cat.id)}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: catData.enabled ? "#2A6B5A" : "rgba(0,0,0,0.14)",
                  position: "relative", transition: "background .2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3, left: catData.enabled ? 21 : 3,
                  transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>

              {categoryIcons[cat.id] && (
                <span style={{ fontSize: 16 }}>{categoryIcons[cat.id]}</span>
              )}
              <span style={{
                flex: 1, fontSize: 13, fontWeight: 500,
                color: catData.enabled ? "#1A1A1A" : "#9A9A9A",
              }}>{cat.label}</span>

              {catData.enabled && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#6B6B6B" }}>
                    {(catData[itemsKey] || []).length} entrée{(catData[itemsKey] || []).length !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, border: "none",
                      background: "rgba(0,0,0,0.05)", cursor: "pointer", fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform .2s",
                    }}
                  >▼</button>
                </div>
              )}
            </div>

            {/* Category content */}
            {catData.enabled && isOpen && (
              <div style={{
                padding: "14px 16px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                background: "#FAFAF8",
              }}>
                <RepeatableBlock
                  items={catData[itemsKey] || []}
                  onChange={items => setCatItems(cat.id, items)}
                  addLabel={itemAddLabel}
                  header={(item) => item.name || "Nouvelle entrée"}
                  fields={itemFields}
                />
              </div>
            )}
          </div>
        );
      })}

      {onCustomFieldsChange && (
        <div style={{ marginTop: 8 }}>
          <CustomFieldsBlock value={customFields} onChange={onCustomFieldsChange} />
        </div>
      )}
    </div>
  );
}
