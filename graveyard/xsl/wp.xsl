<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


    <!--
  <xsl:strip-space elements="*"/>
  -->

  <xsl:template match="/series">
    <span>
      <!--
      <xsl:param name="count" select="0" />
      <xsl:apply-templates select="session">
        <xsl:with-param select="$count+1"/>
      </xsl:apply-templates>
      -->

      <xsl:for-each select="session">
        <xsl:call-template name="session">
          <xsl:with-param name="counter" select="position()"/>
        </xsl:call-template>
      </xsl:for-each>
      
    </span>
  </xsl:template>

  <!--
  <xsl:template match="/series/session">
    -->
  <xsl:template name="session">
    <xsl:param name="counter" />
    <div style="font-weight: bold">Session <xsl:value-of select="$counter" /> (<xsl:value-of select="title" />)</div>
    <div>
      <xsl:value-of select="detail" />
    </div>
    <div>
      <xsl:for-each select="docs/doc">
        <a><xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute><xsl:value-of select="title" /><img src="http://tedesche.s3.amazonaws.com/images/pdficon.gif" /></a>
        <br />
      </xsl:for-each>
      <a><xsl:attribute name="href"><xsl:value-of select="audio/link" /></xsl:attribute>Audio Recording (MP3)</a>
    </div>
    <div><xsl:text disable-output-escaping="yes"><![CDATA[&nbsp;]]></xsl:text></div>
  </xsl:template>

</xsl:stylesheet>
