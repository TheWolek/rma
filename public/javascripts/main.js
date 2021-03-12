$(function () {
    const tableHolder = $("#container")
    tableHolder.html(showTableHeader())
    function showTableHeader() {
        let table = document.createElement("table")
        table.id = "content"
        let headers = document.createElement("thead")
        let tr = document.createElement("tr")
        let columns = ["nr zlecenia", "producent", "model", "SN"]

        columns.forEach(col => {
            let th = document.createElement("th")
            let txt = document.createTextNode(col)
            th.appendChild(txt)
            tr.appendChild(th)
        })

        headers.appendChild(tr)
        table.appendChild(headers)
        return table
    }

    function showContent(data) {
        let t = showTableHeader()
        data.forEach(item => {
            let row = document.createElement("tr")
            Object.keys(item).forEach(key => {
                if (!["ID","sprzedaz","fv","opis"].includes(key)) {
                    let cell = document.createElement("td")
                    let txt = document.createTextNode(item[key])
                    cell.appendChild(txt)
                    row.appendChild(cell)
                }
            })
            t.appendChild(row)
        })
        
        tableHolder.html(t)
    }

    $("#search").submit(function (e) {
        let rma = $("#rma").val()
        fetch('http://localhost:3000/panel/find', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({rma: rma})
            }).then(res => res.json())
            .then(res => { console.log(res); showContent(res)});
        
        return false;
    })
})