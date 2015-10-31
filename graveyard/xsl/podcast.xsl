<xsl:stylesheet version="1.0"
    xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">


  <xsl:template match="/series">
    <rss version="2.0">
      <channel>
        <title>CatholicPatrimony.com - <xsl:value-of select="title" /></title>
        <link>http://www.catholicpatrimony.com/podcast-archives/<xsl:value-of select="normalizedTitle" />.xml</link>
        <description><xsl:value-of select="description" /></description>
        <language>en</language>
        <itunes:owner><itunes:email>dtedesche@gmail.com</itunes:email></itunes:owner>
        <itunes:image href="http://www.catholic.com/sites/default/files/images/pages/cal_podcast_0.jpg" />
        <xsl:apply-templates select="session" />
      </channel>
    </rss>
  </xsl:template>

  <xsl:template match="/series/session">
    <item>
      <title><xsl:value-of select="title" /></title>
      <link><xsl:value-of select="audio/link" /></link>
       <description><xsl:value-of select="detail" /></description>
       <category domain="http://www.catholic.com/category/categories/culture">Culture</category>
       <pubDate><xsl:value-of select="audio/date" /></pubDate>
       <enclosure url="http://www.catholic.com/sites/default/files/audio/radioshows/ca121026b.mp3" length="18284185" type="audio/mpeg" />
       <itunes:duration><xsl:value-of select="audio/length" /></itunes:duration>
       <itunes:author>David Tedesche</itunes:author>
       <itunes:subtitle />
       <itunes:summary />
       <guid isPermaLink="false"><xsl:value-of select="audio/link" /></guid>
    </item>
  </xsl:template>
</xsl:stylesheet>
