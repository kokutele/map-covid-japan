## get open data

use `curl` to download xls file from [open data](https://www.mhlw.go.jp/stf/seisakunitsuite/newpage_00023.html), output filename will be `beds_[yyyymmdd].xls`

* example

```bash
$ curl -o beds_20210505.xls  https://www.mhlw.go.jp/content/10900000/000776985.xlsx
```

## export xls to json

use `xls2json.js`, output filenae will be `beds_[yyyymmdd].json`

* example

```bash
$ node xls2json.js beds_20210505.xls > beds_20210505.json
```

## update config.json

```bash
vi ../config.json
...snip...
```