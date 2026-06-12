# Data files for the Digital Project page / 数字项目数据说明

## SOIC Sales Catalogues 1733–1759 — full translation corpus（完整翻译语料）

Source: Riksarkivet, Ostindiska kompaniet, Försäljningsböcker
(SE/RA/420132/31/2, microfilm R0002253–R0002259) + Warwick digital series.
Chinese translation completed June 2026. **21 volumes, 2,003 pages, 1,469 tables.**

### archive/（全文 JSON，逐卷）
- `archive/index.json` — volume list with page/block counts（卷目录）
- `archive/vol01.json … vol21.json` — full translated text, page by page.
  Schema: `{title, pages:[{n, blocks:[{t,x}|{t:"tb",rows}]}]}` where
  `t` = `p` paragraph / `h` heading / `n` translator's note（译注）/ `li` list item / `tb` table.
- Rendered at `archive.html`（在线阅读、检索、数据库界面）。

### soic_auction_records_1733_1759.csv（拍卖记录，已清洗）
19,000+ rows extracted from the ledger tables: `volume, page, table_id,
lot_no, qty_or_unit, item, buyer, price`. Column mapping was inferred from
table headers; ~1% of rows from headerless tables may have shifted columns —
cross-check against `soic_archive_tables_full.csv` before quantitative use.
买家名、价格以原表为准，存疑行请回查原表 CSV 与 archive.html 对应页。

### soic_archive_tables_full.csv（全部表格原始行，未清洗）
All 25,000+ table rows as they appear in the translation, with volume/page/table
coordinates (`c1–c8` raw columns). The authoritative dump; the curated CSV
above is derived from it.

### Known limitations（已知局限）
- Pages damaged in the originals are marked 〔无法辨认〕/□ in the translation.
- Buyer-name spellings follow the manuscripts and vary (e.g. Sahlgren/Dahlgren);
  names marked (?) await verification.
- Prices keep original notation (½, ¼) and are **not** currency-normalized yet.

---

## soic_voyages.csv(航次数据)
Seed rows only — 目前只有 3 条文献充分的种子航次。请用 Koninckx (1980) 附录的
完整航次表(或你掌握的哥德堡大学图书馆 Ostindie 数据库)逐步补全 132 个航次。
每行必须填 `source` 列(出处)。补完后把 digital.html 里 `VOYAGES` 常量同步更新。

## china_root_cargo.csv(土茯苓货物数据)
全部为模板行(`is_example=TRUE`),页面会自动忽略示例行。
把你从 SOIC/EIC 档案和美国报纸转录的真实记录填入,删掉 is_example 标记或设为 FALSE。
`archive_source` 必须填档案馆架号或报纸出处——这是项目可信度的关键。

## 需要你核对的数字(已在页面脚注标明出处)
- 每期特许状(oktroj)的航次数:25 / 36 / 39 / 29 / 3(合计 132)。
  此分期数字转引自 Frängsmyr (1976) / Koninckx (1980) 的通行说法,
  请与你手头文献核对后再公开宣传该页面;若有出入直接改 digital.html 里的 CHARTERS 常量。
- 132 次远航、129 次赴广州、3 次赴印度、1806 年最后离穗、1813 年闭馆:
  来自你自己的论文〈清代瑞典與香山文化〉,无需再核。

## 引用格式建议
Han, Jincheng. "Tracing the China Trade: SOIC Voyages and the Global Journey of
China Root (1732–1813)." Digital project, 2026. https://[你的域名]/digital.html
License: CC BY 4.0
