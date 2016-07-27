﻿"use strict";
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

    let Table = new Array();
    let pos;

    function LocalDictionaryScript() {
        // Local Script Module
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
        this.Start = function () {
            // 資源テーブル初期設定
            Table.push(this.Init());

            Table[0].Name = "NaN";           // [0]:"NaN"
            pos = 1;
        };
        this.Add = function (fname, logic) {
            // シーケンス情報追加
            Table.push(this.Init());				// 最後尾に領域作成
            let w1 = Table.length - 1;
            Table[w1].Number = w1;          // シーケンス番号設定
            Table[w1 - 1].Link.Next = w1;   // 現情報位置登録
            Table[w1].Link.Last = w1 - 1;   // 前情報位置登録
            Table[w1].Name = fname;			// ファンクション名の登録
            Table[w1].Logic = logic;		// ファンクション登録

            pos++;
            return w1;						// 管理番号を返す
        }
        this.Del = function () {
            // シーケンス情報抜き取り（削除）
            let w1 = Table.length - 1;

            let o3 = this.Init();
            if (w1 > 0) {   // 削除対象の要素が有るか？
                o3.Number = Table[w1].Number;   // シーケンス番号の取り出し
                o3.Name =Table[w1].Name;		// ファンクション名の取り出し
                o3.Logic = Table[w1].Logic;		// ファンクション登録の取り出し
                o3.Result = Table[w1].Result;	// 結果情報の取り出し
                o3.Link.Last = Table[w1].Link.Last;
                Table[w1 - 1].Link.Next = o3.Link.Next;   // 終端情報を設定

                Table.pop();					// 管理領域のから削除
                --pos;
            }
            return o3;
        }
        this.Dup = function () {
            // シーケンス情報重複
            let w1 = Table.length - 1;
            let logic = Table[w1].Logic;        // 複写情報を取り出す
            let fname = Table[w1].Name;

            return this.Add(fname, logic);	    // 重複情報を登録し、管理番号を返す
        }
    }

    window.LocalDictionaryScript = LocalDictionaryScript;
}(window));