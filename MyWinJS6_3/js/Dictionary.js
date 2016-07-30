"use strict";
/*
	ディクショナリ専用パッケージ

	(内容)
	ディクショナリで使う要素の管理・操作を行う。

    （注意）
    ・リソース関連を扱う、WebStorage
    ・周期起動や並行処理の為の、Worker
    これら二つは、専用の別ファイルを作成して対応する事。
*/

(function (window) {
    // ４）辞書情報
    const dfO8 = {
        kind: "",                   // 種別情報　"M":管理情報　"V":変数情報 "T":先頭情報
        DLink: null,                // Ｌｉｎｋ情報

        set Kind(value) { this.kind = value; },
        get Kind() { return this.kind; },
        get Link() { return this.DLink; }
    };

    let Table = new Array();
    let pos;

    function LocalDictionaryScript() {
        // Local Dictionary Script

        // モジュール名：Init
        // 　　　　入力：なし
        //　　 　　出力：o3　・・・　新しい初期領域
        // 　　処理内容：辞書テーブル情報を作成する
        this.Init = function () {
            // 初期領域作成
            let o9 = Object.create(dfO8);   // テンプレートを取り出し
            o9.kind = "";					// 種別情報のリセット
            o9.DLink = null;                // Ｌｉｎｋ情報のリセット

            return o9;						// 新しい初期領域を返す。
        };
        // モジュール名：Start
        // 　　　　入力：なし
        // 　　　　出力：なし
        // 　　処理内容：辞書テーブル情報を初期設定する
        //       その他：先頭ファンクション名強制設定 2016.05.29
        this.Start = function () {
            // 資源テーブル初期設定
            Table.push(this.Init());

            Table[0].kind = "T";             // [0]:{"T" , Null}
            Table[0].DLink = null;

            pos = 1;
        };

        // モジュール名：dSetMod
        // 　　　　入力：module　・・・　モジュール情報
        //　　 　　出力：w1　・・・　辞書テーブルの管理番号
        // 　　処理内容：辞書テーブルにモジュール情報を設定する
        this.dSetMod = function (module) {
            // モジュール情報追加
            Table.push(this.Init());				// 最後尾に領域作成

            let w1 = Table.length - 1;
            Table[w1].kind = "M";               // [w1]:{"M" , [モジュール情報]}
            Table[w1].DLink = module;

            return w1;						// 管理番号を返す
        };

        // モジュール名：dSetVal
        // 　　　　入力：variable　・・・　資源情報
        //　　 　　出力：w1　・・・　辞書テーブルの管理番号
        // 　　処理内容：辞書テーブルに資源情報を設定する
        this.dSetVal = function (variable) {
            // 資源情報追加
            Table.push(this.Init());				// 最後尾に領域作成

            let w1 = Table.length - 1;
            Table[w1].kind = "V";               // [w1]:{"V" , [資源情報]}
            Table[w1].DLink = variable;

            return w1;						// 管理番号を返す
        };
    };

    window.LocalDictionaryScript = LocalDictionaryScript;
}(window));

/*
	ディクショナリ補助パッケージ

	(内容)
	ディクショナリで使う要素の補助を行う。

    (注意)
    [Function.js][Variable.js]に用意されているTableの型を使っている。
    テーブル構成が変わった場合、併せて変更すること。
*/
(function (window) {
    // １）リンク情報
    const dfO1 = {
        last: Number.MIN_VALUE,     // 前情報位置
        next: Number.MAX_VALUE,     // 次情報位置

        set Last(value) { this.last = value; },
        set Next(value) { this.next = value; },
        get Last() { return this.last; },
        get Next() { return this.next; }
    };

    // ２）管理情報
    const dfO2 = {
        number: 0,			        // 管理番号
        Link: null,			        // リンク情報 （o1：リンク情報 を設定する）
        name: "",                   // 関数名
        Logic: function () { },		// ファンクション
        result: "",                 // 結果情報（テキスト）

        set Number(value) { this.number = value; },
        set Name(value) { this.name = value; },
        set Result(value) { this.result = value; },
        get Number() { return this.number; },
        get Name() { return this.name; },
        get Result() { return this.result; }
    };

    // ３）変数情報
    const dfO4 = {
        name: "",                   // 名称
        argc: 0,                    // 要素数
        argv: [],                   // 要素リスト
        result: "",                 // 結果情報（テキスト）

        set Name(value) { this.name = value; },
        set Argc(value) { this.argc = value; },
        set Argv(value) { this.argv = value; },
        set Result(value) { this.result = value; },
        get Name() { return this.name; },
        get Argc() { return this.argc; },
        get Argv() { return this.argv; },
        get Result() { return this.result; }
    };

    function SubDictionaryScript() {
        // Sub Dictionary Script
        // モジュール名：Init
        // 　　　　入力：なし
        //　　 　　出力：o3　・・・　新しい初期領域
        // 　　処理内容：資源テーブル情報を作成する
        this.Init = function () {
            // 初期領域作成
            let o3 = Object.create(dfO2);     // テンプレートを取り出し
            o3.Number = 0;                  // 管理番号仮設定
            o3.Link = Object.create(dfO1);    // リンク情報の登録
            o3.Name = "";					// ファンクション名のリセット
            o3.Logic = null;                // ファンクション登録のリセット
            o3.Result = "";					// 結果情報のリセット

            return o3;						// 新しい初期領域を返す。
        };
        // モジュール名：vInit
        // 　　　　入力：なし
        //　　 　　出力：なし
        // 　　処理内容：資源テーブル情報を作成する
        this.vInit = function () {                   // 初期領域作成
            let o5 = Object.create(dfO4);     // テンプレートを取り出し
            o5.Name = "";					// 要素名のリセット
            o5.Argc = 0;					// 要素数のリセット
            o5.Argv = null;					// 要素リストのリセット
            o5.Result = "";					// 結果情報のリセット

            return o5;						// 新しい初期領域を返す。
        };
    };

    window.SubDictionaryScript = SubDictionaryScript;
}(window));
