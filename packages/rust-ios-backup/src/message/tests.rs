use super::xml;
use serde_json::json;

#[test]
fn xml_values_match_web_parser_vectors() {
    // Independent outputs from the web controller's configured fast-xml-parser.
    // Attribute strings, repeated nodes, CDATA, and large numeric-looking IDs
    // are particularly easy to change when switching XML libraries.
    for (input, expected) in [
        (
            r#"<?xml version="1.0"?><msg><item count="001">001</item><item>9007199254740993</item><empty/><flag>false</flag></msg>"#,
            json!({"?xml":{"@_version":"1.0"},"msg":{"item":[{"@_count":"001","#text":1.0},"9007199254740993"],"empty":"","flag":false}}),
        ),
        (
            "<msg><appmsg><title>001</title><des>false</des><type>57</type><refermsg><svrid>9007199254740993</svrid><displayname>true</displayname><content><![CDATA[ <msg>42</msg> ]]></content></refermsg></appmsg></msg>",
            json!({"msg":{"appmsg":{"title":"001","des":"false","type":57.0,"refermsg":{"svrid":"9007199254740993","displayname":"true","content":" <msg>42</msg> "}}}}),
        ),
        (
            "<msg><v>a &amp; b &#x41;</v><v><![CDATA[ a &amp; b ]]></v><v>42<![CDATA[]]></v><v> a <!--comment--> b </v></msg>",
            json!({"msg":{"v":["a & b &#x41;"," a &amp; b ","42","a  b"]}}),
        ),
        (
            "<msg><appmsg><title>Hello & world</title><type>5</type></appmsg></msg>",
            json!({"msg":{"appmsg":{"title":"Hello & world","type":5.0}}}),
        ),
        (
            "<msg><v>1<?pi?>2</v><v>1<?pi?> 2 </v></msg>",
            json!({"msg":{"v":[{"?pi":"","#text":"12"},{"?pi":"","#text":"12"}]}}),
        ),
    ] {
        assert_eq!(xml::parse(input, true).unwrap(), expected);
    }
    assert_eq!(
        xml::parse("<msg><fromusername>007</fromusername></msg>", false).unwrap(),
        json!({"msg":{"fromusername":7.0}}),
    );
}
