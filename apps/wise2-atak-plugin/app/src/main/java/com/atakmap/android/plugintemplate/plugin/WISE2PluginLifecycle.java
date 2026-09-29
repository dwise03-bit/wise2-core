package com.atakmap.android.plugintemplate.plugin;

import android.content.Context;
import com.atak.plugins.impl.AbstractPlugin;
import com.atak.plugins.impl.PluginContextProvider;
import gov.tak.api.plugin.IServiceController;
import com.atakmap.android.plugintemplate.PluginTemplateMapComponent;

/** WISE² ATAK entry point. Radio transport is intentionally started by the tool lifecycle. */
public final class WISE2PluginLifecycle extends AbstractPlugin {
    public WISE2PluginLifecycle(IServiceController services) {
        super(services,
                new PluginTemplateTool(services.getService(PluginContextProvider.class).getPluginContext()),
                new PluginTemplateMapComponent());
    }
}
